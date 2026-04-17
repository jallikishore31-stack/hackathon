import React from 'react';

interface FilterFormProps {
  location: string;
  setLocation: (val: string) => void;
  maxFees: string;
  setMaxFees: (val: string) => void;
  course: string;
  setCourse: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  userRank: string;
  setUserRank: (val: string) => void;
  handleSearch: (e?: React.FormEvent) => void;
  handleReset: () => void;
}

export const FilterForm: React.FC<FilterFormProps> = ({
  location, setLocation, 
  maxFees, setMaxFees, 
  course, setCourse, 
  category, setCategory, 
  userRank, setUserRank, 
  handleSearch, handleReset
}) => {
  return (
    <form onSubmit={handleSearch} className="search-form glass-panel">
      <div className="input-group">
          <label>Location</label>
          <input
          type="text"
          placeholder="e.g. Mumbai, Delhi"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          />
      </div>
      <div className="input-group">
          <label>Max Budget (₹)</label>
          <input
          type="number"
          placeholder="e.g. 200000"
          value={maxFees}
          onChange={(e) => setMaxFees(e.target.value)}
          />
      </div>
      <div className="input-group">
          <label>Course Focus</label>
          <input
          type="text"
          placeholder="e.g. Computer Science"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          />
      </div>
      <div className="input-group">
          <label>College Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
            <option value="">All Categories</option>
            <option value="IIT">IIT</option>
            <option value="NIT">NIT</option>
            <option value="IIIT">IIIT</option>
            <option value="Central University">Central University</option>
            <option value="State Government">State Government</option>
            <option value="Private/Deemed">Private/Deemed</option>
            <option value="Engineering College">Engineering College</option>
          </select>
      </div>
      <div className="input-group">
          <label>Your Rank</label>
          <input
          type="number"
          placeholder="e.g. 5000"
          value={userRank}
          onChange={(e) => setUserRank(e.target.value)}
          />
      </div>
      <div className="form-actions">
          <button type="submit" className="search-btn pulse-glow">🔍 Smart Match</button>
          <button type="button" className="reset-btn" onClick={handleReset}>↺ Reset</button>
      </div>
    </form>
  )
}
