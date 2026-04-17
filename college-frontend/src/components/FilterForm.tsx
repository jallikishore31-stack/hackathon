import React from 'react';

interface FilterFormProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
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
  searchQuery, setSearchQuery,
  location, setLocation, 
  maxFees, setMaxFees, 
  course, setCourse, 
  category, setCategory, 
  userRank, setUserRank, 
  handleSearch, handleReset
}) => {
  return (
    <form onSubmit={handleSearch} className="search-form glass-panel">
      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Search College</label>
          <input
          type="text"
          placeholder="Search for any specific college by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-main"
          style={{ padding: '0.8rem', fontSize: '1.1rem', width: '100%' }}
          />
      </div>
      <div className="input-group">
          <label>Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="category-select">
            <option value="">All Regions</option>
            <option value="Delhi">Delhi / NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Pune">Pune</option>
            <option value="Kolkata">Kolkata</option>
          </select>
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
          <select value={course} onChange={(e) => setCourse(e.target.value)} className="category-select">
            <option value="">All Courses</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Information Technology">IT</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="Chemical">Chemical</option>
          </select>
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
