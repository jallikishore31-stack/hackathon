import React, { useState } from 'react';
import type { College } from '../types';

interface CollegeCardProps {
  college: College;
  userRank: string;
  isCompared: boolean;
  onCompareToggle: (id: number) => void;
  onRefreshReviews: (id: number) => Promise<void>;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, userRank, isCompared, onCompareToggle, onRefreshReviews }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshReviews(college.id);
    setIsRefreshing(false);
  };

  const totalFees = college.fees ? college.fees.toLocaleString() : ((college.tuition_fees || 0) + (college.hostel_fees || 0)).toLocaleString();
  
  let matchMessage = "Analyzing...";
  let isMatch = false;
  if (userRank && college.closing_rank) {
      if (parseInt(userRank) <= college.closing_rank) {
          matchMessage = "Great Match! Your rank qualifies.";
          isMatch = true;
      } else {
          matchMessage = "Reach! Your rank is lower than typical closing.";
          isMatch = false;
      }
  }

  return (
    <div className="college-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{college.name}</h2>
            <span className="rating-badge">★ {college.rating}/5.0</span>
          </div>
          <label className="compare-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
            <input type="checkbox" checked={isCompared} onChange={() => onCompareToggle(college.id)} />
            Compare
          </label>
      </div>
      <div className="card-body">
          {typeof college.match_score === 'number' && (
            <p><strong>🎯 Match Score:</strong> {college.match_score.toFixed(1)}%</p>
          )}
          {college.match_reasons && college.match_reasons.length > 0 && (
            <p><strong>Why it matched:</strong> {college.match_reasons.join(', ')}</p>
          )}
          <p><strong>📍 Location:</strong> {college.location}</p>
          <p><strong>💰 Total Fees:</strong> ₹{totalFees}</p>
          {college.tuition_fees && <p className="sub-fee">Tuition: ₹{college.tuition_fees.toLocaleString()}</p>}
          {college.hostel_fees && <p className="sub-fee">Hostel: ₹{college.hostel_fees.toLocaleString()}</p>}
          <p><strong>🚦 Category:</strong> {college.category || 'General'}</p>
          <p><strong>📈 Closing Rank:</strong> {college.closing_rank ? college.closing_rank.toLocaleString() : 'N/A'}</p>
          {userRank && college.closing_rank && (
              <p className={`match-indicator ${isMatch ? 'success-match' : 'warning-match'}`}>
                <strong>🎯 Rank Match:</strong> {matchMessage}
              </p> 
          )}
      </div>
      <div className="courses">
        <strong>Available Courses:</strong>
        <ul>
          {college.courses && college.courses.map((crs, idx) => (
            <li key={idx}>{crs}</li>
          ))}
        </ul>
      </div>
      <div className="reviews" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Student Reviews:</strong>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleRefresh} disabled={isRefreshing} className="search-btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
              {isRefreshing ? 'Fetching...' : '🔄 Refresh API'}
            </button>
            <button onClick={() => setShowReviews(!showReviews)} className="reset-btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
              {showReviews ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {showReviews && (
          <div className="fade-in-down" style={{ marginTop: '0.5rem' }}>
            {college.reviews && college.reviews.length > 0 ? (
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {college.reviews.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{r.user}</span>
                      <span style={{ color: '#ffd700', fontSize: '0.9rem' }}>★ {r.rating.toFixed(1)}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9 }}>"{r.comment}"</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No reviews available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
