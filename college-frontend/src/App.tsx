import { useState, useEffect } from 'react'
import './App.css'
import type { College } from './types'
import { CollegeCard } from './components/CollegeCard'
import { FilterForm } from './components/FilterForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000'

function App() {
  const [colleges, setColleges] = useState<College[]>([])
  const [location, setLocation] = useState('')
  const [maxFees, setMaxFees] = useState('')
  const [userRank, setUserRank] = useState('')
  const [course, setCourse] = useState('')
  const [category, setCategory] = useState('')
  const [activePreference, setActivePreference] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    location?: string
    maxFees?: string
    course?: string
    userRank?: string
    category?: string
  }) => {
    const searchLocation = filters?.location ?? location
    const searchMaxFees = filters?.maxFees ?? maxFees
    const searchCourse = filters?.course ?? course
    const searchUserRank = filters?.userRank ?? userRank
    const searchCategory = filters?.category ?? category

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
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
                <CollegeCard college={college} userRank={userRank} />
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
    </div>
  )
}

export default App
