import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listings/${id}`)
      if (!response.ok) {
        throw new Error('Listing not found')
      }
      const data = await response.json()
      setListing(data)
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await fetch(`${API_URL}/api/listings/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        navigate('/')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-available'
      case 'pending':
        return 'status-pending'
      case 'sold':
        return 'status-sold'
      default:
        return ''
    }
  }

  if (loading) {
    return <div className="loading">Loading listing...</div>
  }

  if (!listing) {
    return (
      <div className="detail-page">
        <div className="empty-state">
          <h3>Listing not found</h3>
          <p>This gingerbread house may have been demolished or eaten.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        ← Back to listings
      </Link>

      <div className="detail-grid">
        <div>
          <div style={{ position: 'relative' }}>
            <img
              src={listing.image_url || 'https://via.placeholder.com/800x500?text=Gingerbread+House'}
              alt={listing.title}
              className="detail-image"
            />
            <span
              className={`listing-status ${getStatusClass(listing.status)}`}
              style={{ position: 'absolute', top: '1rem', left: '1rem' }}
            >
              {listing.status}
            </span>
          </div>

          <div className="detail-description" style={{ marginTop: '2rem' }}>
            <h3>About This Property</h3>
            <p>{listing.description || 'No description available.'}</p>
          </div>
        </div>

        <div className="detail-info">
          <span className="listing-type-badge">{listing.listing_type}</span>
          <div className="detail-price">{formatPrice(listing.price)}</div>
          <div className="detail-address">{listing.address}</div>
          <div className="detail-neighborhood">{listing.neighborhood}</div>

          <div className="detail-stats">
            {listing.square_feet && (
              <div className="stat">
                <div className="stat-icon">📐</div>
                <div className="stat-value">{listing.square_feet.toLocaleString()}</div>
                <div className="stat-label">Sq Ft</div>
              </div>
            )}
            {listing.num_rooms && (
              <div className="stat">
                <div className="stat-icon">🚪</div>
                <div className="stat-value">{listing.num_rooms}</div>
                <div className="stat-label">Rooms</div>
              </div>
            )}
            {listing.num_candy_canes && (
              <div className="stat">
                <div className="stat-icon">🍬</div>
                <div className="stat-value">{listing.num_candy_canes}</div>
                <div className="stat-label">Candy Canes</div>
              </div>
            )}
            {listing.frosting_type && (
              <div className="stat">
                <div className="stat-icon">🧁</div>
                <div className="stat-value" style={{ fontSize: '1rem' }}>{listing.frosting_type}</div>
                <div className="stat-label">Frosting</div>
              </div>
            )}
          </div>

          <div className="detail-features">
            <h3>Features</h3>
            <div className="features-list">
              {listing.has_gumdrop_garden && (
                <div className="feature-item">Gumdrop Garden</div>
              )}
              {listing.frosting_type && (
                <div className="feature-item">{listing.frosting_type} Frosting</div>
              )}
              {listing.num_candy_canes > 50 && (
                <div className="feature-item">Extensive Candy Cane Decor</div>
              )}
              {listing.square_feet > 2000 && (
                <div className="feature-item">Spacious Interior</div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <Link to={`/edit/${listing.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              Edit Listing
            </Link>
            <button onClick={handleDelete} className="btn btn-secondary" style={{ flex: 1, background: '#fee', color: '#c00' }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetail
