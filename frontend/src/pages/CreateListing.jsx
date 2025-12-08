import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || ''

function CreateListing() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { getAuthHeaders } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    neighborhood: '',
    square_feet: '',
    num_rooms: '',
    num_candy_canes: '',
    has_gumdrop_garden: false,
    frosting_type: '',
    listing_type: 'cottage',
    status: 'available',
    image_url: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) {
      fetchListing()
    }
  }, [id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listings/${id}`)
      if (!response.ok) throw new Error('Listing not found')
      const data = await response.json()
      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        square_feet: data.square_feet || '',
        num_rooms: data.num_rooms || '',
        num_candy_canes: data.num_candy_canes || '',
        has_gumdrop_garden: data.has_gumdrop_garden || false,
        frosting_type: data.frosting_type || '',
        listing_type: data.listing_type || 'cottage',
        status: data.status || 'available',
        image_url: data.image_url || '',
      })
    } catch (error) {
      console.error('Error fetching listing:', error)
      setError('Failed to load listing')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      image_url: url,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        num_rooms: formData.num_rooms ? parseInt(formData.num_rooms) : null,
        num_candy_canes: formData.num_candy_canes ? parseInt(formData.num_candy_canes) : null,
      }

      const url = isEditing ? `${API_URL}/api/listings/${id}` : `${API_URL}/api/listings`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save listing')
      }

      const data = await response.json()
      navigate(`/listing/${data.id}`)
    } catch (error) {
      console.error('Error saving listing:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <Link to="/" className="back-link">
        ← Back to listings
      </Link>

      <h1>{isEditing ? 'Edit Listing' : 'List Your Gingerbread House'}</h1>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: '#fee',
            color: '#c00',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Property Image</label>
          <ImageUpload onUpload={handleImageUpload} currentImage={formData.image_url} />
        </div>

        <div className="form-group">
          <label>
            Title * <span className="char-count">({formData.title.length}/255)</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Cozy Peppermint Cottage"
            maxLength={255}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your gingerbread house..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 250000"
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="listing_type" value={formData.listing_type} onChange={handleChange}>
              <option value="cottage">Cottage</option>
              <option value="mansion">Mansion</option>
              <option value="cabin">Cabin</option>
              <option value="castle">Castle</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Address * <span className="char-count">({formData.address.length}/255)</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 123 Candy Lane"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Neighborhood <span className="char-count">({formData.neighborhood.length}/200)</span>
            </label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              placeholder="e.g., Sugar Plum Village"
              maxLength={200}
            />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Square Feet</label>
            <input
              type="number"
              name="square_feet"
              value={formData.square_feet}
              onChange={handleChange}
              placeholder="e.g., 1200"
            />
          </div>

          <div className="form-group">
            <label>Number of Rooms</label>
            <input
              type="number"
              name="num_rooms"
              value={formData.num_rooms}
              onChange={handleChange}
              placeholder="e.g., 4"
            />
          </div>

          <div className="form-group">
            <label>Candy Canes</label>
            <input
              type="number"
              name="num_candy_canes"
              value={formData.num_candy_canes}
              onChange={handleChange}
              placeholder="e.g., 24"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Frosting Type{' '}
              <span className="char-count">({formData.frosting_type.length}/500)</span>
            </label>
            <input
              type="text"
              name="frosting_type"
              value={formData.frosting_type}
              onChange={handleChange}
              placeholder="e.g., Royal Icing"
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              name="has_gumdrop_garden"
              id="has_gumdrop_garden"
              checked={formData.has_gumdrop_garden}
              onChange={handleChange}
            />
            <label htmlFor="has_gumdrop_garden">Has Gumdrop Garden</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Listing' : 'Create Listing'}
          </button>
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default CreateListing
