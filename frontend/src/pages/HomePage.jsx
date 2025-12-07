import { useState, useEffect } from 'react'
import ListingCard from '../components/ListingCard'
import SearchFilters from '../components/SearchFilters'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function HomePage() {
  const [listings, setListings] = useState([])
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    min_price: '',
    max_price: '',
    neighborhood: '',
    listing_type: '',
    status: '',
    min_rooms: '',
    has_gumdrop_garden: '',
  })

  useEffect(() => {
    fetchNeighborhoods()
    fetchListings()
  }, [])

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/neighborhoods`)
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`${API_URL}/api/listings?${params}`)
      const data = await response.json()
      setListings(data)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchQuery }))
  }

  return (
    <div>
      <section className="hero">
        <h1>Find Your Dream Gingerbread Home</h1>
        <p>Browse the sweetest real estate listings in all the land</p>
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by location, neighborhood, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      <SearchFilters
        filters={filters}
        setFilters={setFilters}
        neighborhoods={neighborhoods}
      />

      <main className="main-content">
        <div className="results-header">
          <div className="results-count">
            <strong>{listings.length}</strong> gingerbread homes available
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h3>No listings found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
