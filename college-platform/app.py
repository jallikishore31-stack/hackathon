import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from extensions import db
from models import College, SyncState
from scheduler import start_scheduler
from scraper import scrape_colleges


def _normalize_text(value):
    return (value or '').strip().lower()


def _score_college(college, location, max_fees, course, user_rank, category, search_query):
    score = 0.0
    reasons = []

    normalized_location = _normalize_text(location)
    normalized_course = _normalize_text(course)
    normalized_category = _normalize_text(category)

    if normalized_location:
        college_location = _normalize_text(college.location)
        if normalized_location in college_location:
            score += 35
            reasons.append("location match")
        elif any(token in college_location for token in normalized_location.split()):
            score += 18
            reasons.append("nearby location")

    if search_query:
        normalized_search = _normalize_text(search_query)
        college_name = _normalize_text(college.name)
        if normalized_search in college_name:
            score += 150
            reasons.append("exact name match")
        elif any(term in college_name for term in normalized_search.split()):
            score += 50
            reasons.append("partial name match")

    if max_fees:
        try:
            budget = int(max_fees)
            if college.fees <= budget:
                score += 25
                reasons.append("within budget")
            else:
                overshoot = max(college.fees - budget, 0)
                score += max(0, 18 - (overshoot / max(budget, 1)) * 18)
        except ValueError:
            pass

    if user_rank:
        try:
            rank_val = int(user_rank)
            if college.closing_rank and college.closing_rank >= rank_val:
                score += 25
                reasons.append("rank qualifies")
                score += max(0, 10 - ((college.closing_rank - rank_val) / max(rank_val, 1)) * 10)
            elif college.closing_rank:
                gap = rank_val - college.closing_rank
                score += max(0, 12 - (gap / max(rank_val, 1)) * 12)
        except ValueError:
            pass

    if normalized_course:
        course_blob = " ".join(college.courses or []).lower()
        if normalized_course in course_blob:
            score += 20
            reasons.append("course match")
        elif any(token in course_blob for token in normalized_course.split()):
            score += 10
            reasons.append("related course")

    if normalized_category:
        college_category = _normalize_text(college.category)
        if normalized_category == college_category:
            score += 18
            reasons.append("category match")
        elif normalized_category in college_category or college_category in normalized_category:
            score += 10
            reasons.append("similar category")

    score += min(college.rating * 2, 10)
    return round(score, 2), reasons


def ensure_schema():
    """
    Lightweight schema evolution for SQLite without external migration tooling.
    """
    required_columns = {
        "tuition_fees": "INTEGER NOT NULL DEFAULT 0",
        "hostel_fees": "INTEGER NOT NULL DEFAULT 0",
        "category": "VARCHAR(120) NOT NULL DEFAULT 'General'",
        "reviews": "JSON",
        "placements": "JSON",
        "source_url": "VARCHAR(500)",
        "source_last_modified": "VARCHAR(120)",
        "source_etag": "VARCHAR(120)",
        "source_hash": "VARCHAR(64)"
    }
    existing = {
        row[1]
        for row in db.session.execute(db.text("PRAGMA table_info(college)")).fetchall()
    }
    for column_name, definition in required_columns.items():
        if column_name not in existing:
            db.session.execute(
                db.text(f"ALTER TABLE college ADD COLUMN {column_name} {definition}")
            )
    db.session.commit()


def create_app():
    app = Flask(__name__)
    CORS(app)  # enable CORS for frontend integration
    
    # Configure database (override with DATABASE_URL when needed)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///colleges.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Initialize the database
        db.create_all()
        ensure_schema()
        
        # Trigger an initial sync when data is missing or sync state is not initialized.
        if College.query.count() == 0 or SyncState.query.filter_by(source_name='nirf-engineering').first() is None:
            print("Running initial government data sync...")
            scrape_colleges(app)

    # ----------- REST API Endpoints -----------
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "College Platform API is Running", "endpoints": ["/colleges", "/search"]}), 200

    @app.route('/colleges', methods=['GET'])
    def get_colleges():
        colleges = College.query.all()
        return jsonify([c.to_dict() for c in colleges])

    @app.route('/search', methods=['GET'])
    def search():
        search_query = request.args.get('name') or request.args.get('search')
        location = request.args.get('location')
        # Support both legacy and frontend-friendly query keys
        max_fees = request.args.get('max_fees') or request.args.get('fees')
        course = request.args.get('course')
        user_rank = request.args.get('user_rank') or request.args.get('rank')
        category = request.args.get('category')
        
        query = College.query
        if search_query:
            query = query.filter(College.name.ilike(f'%{search_query}%'))
            
        colleges = query.all()
        scored_colleges = []
        for college in colleges:
            match_score, match_reasons = _score_college(
                college, location, max_fees, course, user_rank, category, search_query
            )
            college_data = college.to_dict()
            college_data["match_score"] = match_score
            college_data["match_reasons"] = match_reasons
            scored_colleges.append(college_data)

        scored_colleges.sort(
            key=lambda item: (
                item["match_score"],
                item.get("rating", 0),
                -(item.get("fees", 0) or 0)
            ),
            reverse=True
        )

        if any([location, max_fees, course, user_rank, category, search_query]):
            scored_colleges = [item for item in scored_colleges if item["match_score"] > 0][:30]
        else:
            scored_colleges = scored_colleges[:50]

        return jsonify(scored_colleges)

    @app.route('/health', methods=['GET'])
    def health():
        try:
            db.session.execute(db.text('SELECT 1'))
            return jsonify({
                "status": "ok",
                "database": "connected"
            }), 200
        except Exception as error:
            return jsonify({
                "status": "error",
                "database": "disconnected",
                "message": str(error)
            }), 500

    @app.route('/sync/status', methods=['GET'])
    def sync_status():
        state = SyncState.query.filter_by(source_name='nirf-engineering').first()
        if not state:
            return jsonify({"status": "not-initialized"}), 200
        return jsonify(state.to_dict()), 200

    @app.route('/add', methods=['POST'])
    def add_college():
        data = request.get_json()
        if not data or 'name' not in data or 'location' not in data:
            return jsonify({"error": "Missing required fields (name, location)"}), 400

        existing = College.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({"error": "College already exists"}), 409

        new_college = College(
            name=data['name'],
            location=data['location'],
            fees=data.get('fees', 0),
            tuition_fees=data.get('tuition_fees', data.get('fees', 0)),
            hostel_fees=data.get('hostel_fees', 0),
            rating=data.get('rating', 0.0),
            closing_rank=data.get('closing_rank', 0),
            category=data.get('category', 'General'),
            courses=data.get('courses', [])
        )
        db.session.add(new_college)
        db.session.commit()
        return jsonify(new_college.to_dict()), 201

    @app.route('/update/<int:id>', methods=['PUT'])
    def update_college(id):
        data = request.get_json()
        college = College.query.get(id)
        
        if not college:
            return jsonify({"error": "College not found"}), 404

        if 'name' in data:
            college.name = data['name']
        if 'location' in data:
            college.location = data['location']
        if 'rating' in data:
            college.rating = data['rating']
        if 'closing_rank' in data:
            college.closing_rank = data['closing_rank']
        if 'category' in data:
            college.category = data['category']
        if 'courses' in data:
            college.courses = data['courses']
        if 'tuition_fees' in data:
            college.tuition_fees = data['tuition_fees']
        if 'hostel_fees' in data:
            college.hostel_fees = data['hostel_fees']
        if 'fees' in data:
            college.fees = data['fees']
            
        db.session.commit()
        return jsonify(college.to_dict()), 200

    @app.route('/colleges/<int:id>/reviews/refresh', methods=['POST'])
    def refresh_reviews(id):
        college = College.query.get(id)
        if not college:
            return jsonify({"error": "College not found"}), 404
            
        # Simulate an external API fetch or scraping Shiksha.com / Google Places
        import random
        from scraper import _generate_reviews
        
        new_rating = min(5.0, college.rating + random.uniform(-0.2, 0.3))
        college.reviews = _generate_reviews(college.name + str(random.randint(100, 999)), new_rating)
        db.session.commit()
        return jsonify(college.to_dict()), 200

    return app

app = create_app()

if __name__ == '__main__':
    # Start the automated periodic background scraping process
    start_scheduler(app)
    # Start flask application
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True,
        use_reloader=False
    ) # Important: use_reloader=False to prevent double scheduler runs