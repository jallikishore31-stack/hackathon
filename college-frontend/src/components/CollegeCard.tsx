import React from 'react';
import type { College } from '../types';

interface CollegeCardProps {
  college: College;
  userRank: string;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, userRank }) => {
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
      <div className="card-header">
          <h2>{college.name}</h2>
          <span className="rating-badge">★ {college.rating}/5.0</span>
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
    </div>
  );
};
