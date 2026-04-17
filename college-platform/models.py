from extensions import db
from datetime import datetime

class College(db.Model):
    __tablename__ = 'college'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    location = db.Column(db.String(255), nullable=False)
    fees = db.Column(db.Integer, nullable=False)
    tuition_fees = db.Column(db.Integer, nullable=False, default=0)
    hostel_fees = db.Column(db.Integer, nullable=False, default=0)
    rating = db.Column(db.Float, nullable=False)
    closing_rank = db.Column(db.Integer, nullable=True, default=0)
    category = db.Column(db.String(120), nullable=False, default='General')
    # Using String to safely store JSON across DBs (especially plain sqlite fallback) if JSON type isn't fully supported without extras, but SQLAlchemy JSON works fine in modern sqlite.
    courses = db.Column(db.JSON, nullable=False)
    reviews = db.Column(db.JSON, nullable=True)
    source_url = db.Column(db.String(500), nullable=True)
    source_last_modified = db.Column(db.String(120), nullable=True)
    source_etag = db.Column(db.String(120), nullable=True)
    source_hash = db.Column(db.String(64), nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "fees": self.fees,
            "tuition_fees": self.tuition_fees,
            "hostel_fees": self.hostel_fees,
            "rating": self.rating,
            "closing_rank": self.closing_rank,
            "category": self.category,
            "courses": self.courses,
            "reviews": self.reviews,
            "source_url": self.source_url,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }


class SyncState(db.Model):
    __tablename__ = 'sync_state'

    id = db.Column(db.Integer, primary_key=True)
    source_name = db.Column(db.String(100), nullable=False, unique=True)
    source_url = db.Column(db.String(500), nullable=False)
    last_etag = db.Column(db.String(120), nullable=True)
    last_modified = db.Column(db.String(120), nullable=True)
    last_payload_hash = db.Column(db.String(64), nullable=True)
    last_status = db.Column(db.String(32), nullable=False, default='never-run')
    last_message = db.Column(db.Text, nullable=True)
    last_record_count = db.Column(db.Integer, nullable=False, default=0)
    runs_count = db.Column(db.Integer, nullable=False, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "source_name": self.source_name,
            "source_url": self.source_url,
            "last_etag": self.last_etag,
            "last_modified": self.last_modified,
            "last_payload_hash": self.last_payload_hash,
            "last_status": self.last_status,
            "last_message": self.last_message,
            "last_record_count": self.last_record_count,
            "runs_count": self.runs_count,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
