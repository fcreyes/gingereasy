function SearchFilters({ filters, setFilters, neighborhoods }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      min_price: '',
      max_price: '',
      neighborhood: '',
      listing_type: '',
      status: '',
      min_rooms: '',
      has_gumdrop_garden: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="filters-section">
      <div className="filters-content">
        <div className="filter-group">
          <label>Price</label>
          <input
            type="number"
            name="min_price"
            placeholder="Min"
            value={filters.min_price}
            onChange={handleChange}
            style={{ width: '100px' }}
          />
          <span>-</span>
          <input
            type="number"
            name="max_price"
            placeholder="Max"
            value={filters.max_price}
            onChange={handleChange}
            style={{ width: '100px' }}
          />
        </div>

        <div className="filter-group">
          <label>Neighborhood</label>
          <select name="neighborhood" value={filters.neighborhood} onChange={handleChange}>
            <option value="">Any</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select name="listing_type" value={filters.listing_type} onChange={handleChange}>
            <option value="">Any</option>
            <option value="cottage">Cottage</option>
            <option value="mansion">Mansion</option>
            <option value="cabin">Cabin</option>
            <option value="castle">Castle</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">Any</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Min Rooms</label>
          <select name="min_rooms" value={filters.min_rooms} onChange={handleChange}>
            <option value="">Any</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
            <option value="8">8+</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Gumdrop Garden</label>
          <select
            name="has_gumdrop_garden"
            value={filters.has_gumdrop_garden}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilters
