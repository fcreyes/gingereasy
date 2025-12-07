import { Link } from 'react-router-dom'

function ListingCard({ listing }) {
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

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-image-container">
        <img
          src={listing.image_url || 'https://via.placeholder.com/400x300?text=Gingerbread+House'}
          alt={listing.title}
          className="listing-image"
        />
        <span className={`listing-status ${getStatusClass(listing.status)}`}>
          {listing.status}
        </span>
      </div>
      <div className="listing-content">
        <span className="listing-type-badge">{listing.listing_type}</span>
        <div className="listing-price">{formatPrice(listing.price)}</div>
        <div className="listing-address">{listing.address}</div>
        <div className="listing-neighborhood">{listing.neighborhood}</div>
        <div className="listing-details">
          {listing.num_rooms && (
            <span className="listing-detail">{listing.num_rooms} rooms</span>
          )}
          {listing.square_feet && (
            <span className="listing-detail">{listing.square_feet.toLocaleString()} sq ft</span>
          )}
          {listing.num_candy_canes && (
            <span className="listing-detail">{listing.num_candy_canes} candy canes</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
