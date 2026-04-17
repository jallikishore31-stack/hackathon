import { useState, useEffect } from 'react'
import './App.css'
import type { College } from './types'
import { CollegeCard } from './components/CollegeCard'
import { FilterForm } from './components/FilterForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000'

function App() {
  const [colleges, setColleges] = useState<College[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [maxFees, setMaxFees] = useState('')
  const [userRank, setUserRank] = useState('')
  const [course, setCourse] = useState('')
  const [category, setCategory] = useState('')
  const [activePreference, setActivePreference] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [compareList, setCompareList] = useState<number[]>([])
  const [showCompare, setShowCompare] = useState(false)

  const handleRefreshReviews = async (id: number) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/colleges/${id}/reviews/refresh`, { method: 'POST' })
      if (resp.ok) {
        const updated = await resp.json()
        setColleges(prev => prev.map(c => c.id === id ? updated : c))
      }
    } catch(err) {
      console.error('Failed to refresh reviews:', err)
    }
  }

  const toggleCompare = (id: number) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) {
        alert("You can only compare up to 4 colleges!");
        return prev;
      }
      return [...prev, id];
    });
  }

  const fetchColleges = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/colleges`)
      if (!response.ok) {
        throw new Error(`Failed to fetch colleges: ${response.status}`)
      }
      const data = await response.json()
      setColleges(data)
    } catch (error) {
      console.error('Error fetching colleges:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialColleges = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/colleges`)
        if (!response.ok) {
          throw new Error(`Failed to fetch colleges: ${response.status}`)
        }
        const data = await response.json()
        if (isMounted) {
          setColleges(data)
        }
      } catch (error) {
        console.error('Error fetching colleges:', error)
      }
    }

    void loadInitialColleges()

    return () => {
      isMounted = false
    }
  }, [])

  const runSearch = async (filters?: {
    searchQuery?: string
    location?: string
    maxFees?: string
    course?: string
    userRank?: string
    category?: string
  }) => {
    const qSearchQuery = filters?.searchQuery ?? searchQuery
    const searchLocation = filters?.location ?? location
    const searchMaxFees = filters?.maxFees ?? maxFees
    const searchCourse = filters?.course ?? course
    const searchUserRank = filters?.userRank ?? userRank
    const searchCategory = filters?.category ?? category

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (qSearchQuery) params.set('search', qSearchQuery)
      if (searchLocation) params.set('location', searchLocation)
      if (searchMaxFees) params.set('max_fees', searchMaxFees)
      if (searchCourse) params.set('course', searchCourse)
      if (searchUserRank) params.set('user_rank', searchUserRank)
      if (searchCategory) params.set('category', searchCategory)

      const queryString = params.toString()
      const response = await fetch(`${API_BASE_URL}/search${queryString ? `?${queryString}` : ''}`)
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      const data = await response.json()
      setColleges(data)
    } catch (error) {
      console.error('Error searching colleges:', error)
    }
    setIsLoading(false)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    await runSearch()
  }

  const handlePreference = (type: string) => {
    setActivePreference(type)
    let nextLocation = ''
    let nextMaxFees = ''
    let nextCourse = ''

    if (type === 'Budget Friendly') {
      nextMaxFees = '150000'
    } else if (type === 'Tech Hubs') {
      nextLocation = 'Delhi'
      nextCourse = 'Computer Science'
    } else if (type === 'Premium Quality') {
      nextMaxFees = '1000000'
    }

    setLocation(nextLocation)
    setMaxFees(nextMaxFees)
    setCourse(nextCourse)
    void runSearch({ location: nextLocation, maxFees: nextMaxFees, course: nextCourse })
  }

  const handleReset = () => {
    setSearchQuery('')
    setLocation('')
    setMaxFees('')
    setUserRank('')
    setCourse('')
    setCategory('')
    setActivePreference('')
    fetchColleges()
  }

  return (
    <div className="container">
      <div className="grid-background"></div>
      <header className="hero-header fade-in-down">
        <h1>College Discovery Platform</h1>
        <p className="subtitle">Discover the perfect college matching your rank, fees, and location.</p>
      </header>
      
      <div className="preferences-bar fade-in-up">
        <span>Quick Modes:</span>
        <button 
          className={`pref-btn ${activePreference === 'Budget Friendly' ? 'active' : ''}`}
          onClick={() => handlePreference('Budget Friendly')}>
          💸 Budget Friendly (&lt;1.5L)
        </button>
        <button 
          className={`pref-btn ${activePreference === 'Tech Hubs' ? 'active' : ''}`}
          onClick={() => handlePreference('Tech Hubs')}>
          💻 Tech Hubs
        </button>
        <button 
          className={`pref-btn ${activePreference === 'Premium Quality' ? 'active' : ''}`}
          onClick={() => handlePreference('Premium Quality')}>
          🌟 Premium Institutes
        </button>
      </div>

      <div className="fade-in-up" style={{animationDelay: '100ms'}}>
        <FilterForm 
          searchQuery={searchQuery} setSearchQuery={(v) => {setSearchQuery(v); setActivePreference('');}}
          location={location} setLocation={(v) => {setLocation(v); setActivePreference('');}}
          maxFees={maxFees} setMaxFees={(v) => {setMaxFees(v); setActivePreference('');}}
          course={course} setCourse={(v) => {setCourse(v); setActivePreference('');}}
          category={category} setCategory={setCategory}
          userRank={userRank} setUserRank={setUserRank}
          handleSearch={handleSearch}
          handleReset={handleReset}
        />
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Running Smart Match Algorithm...</p>
        </div>
      ) : (
        <div className="college-list fade-in-up" style={{animationDelay: '200ms'}}>
          {colleges.length > 0 ? (
            colleges.map((college, idx) => (
              <div style={{animationDelay: `${idx * 50 + 200}ms`}} className="card-wrapper" key={college.id}>
                <CollegeCard 
                  college={college} 
                  userRank={userRank} 
                  isCompared={compareList.includes(college.id)}
                  onCompareToggle={toggleCompare}
                  onRefreshReviews={handleRefreshReviews}
                />
              </div>
            ))
          ) : (
            <div className="empty-state glass-panel">
                <div className="empty-icon">🏜️</div>
                <h3>No Matches Found</h3>
                <p>Try adapting your budget, location, or rank preferences.</p>
                <button onClick={handleReset} className="search-btn mt-4">Reset Filters</button>
            </div>
          )}
        </div>
      )}
    {compareList.length > 0 && (
      <button 
        onClick={() => setShowCompare(true)}
        className="pulse-glow"
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', background: '#ffd700', color: '#111', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', zIndex: 999, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
      >
        Compare {compareList.length}/4
      </button>
    )}

    {showCompare && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#1a1a2e', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Comparison & Priority List</h2>
            <button onClick={() => setShowCompare(false)} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Feature</th>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map((college, idx) => (
                    <th key={college.id} style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '1.2rem', color: idx === 0 ? '#ffd700' : '#fff' }}>{idx === 0 && '🏆 '}{college.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>Rank #{idx + 1} Priority</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Match Score</td>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map(college => (
                    <td key={college.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{college.match_score ? `${college.match_score.toFixed(1)}%` : 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Rating</td>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map(college => (
                    <td key={college.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>★ {college.rating}/5.0</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Fees (Total)</td>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map(college => (
                    <td key={college.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>₹{college.fees ? college.fees.toLocaleString() : ((college.tuition_fees || 0) + (college.hostel_fees || 0)).toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Closing Rank</td>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map(college => (
                    <td key={college.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{college.closing_rank ? college.closing_rank.toLocaleString() : 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Location</td>
                  {[...colleges.filter(c => compareList.includes(c.id))].sort((a,b) => (b.match_score||0) - (a.match_score||0) || b.rating - a.rating).map(college => (
                    <td key={college.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{college.location}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
)
}

export default App
