import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Ginger<span>Easy</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Browse</Link>
          <Link to="/create">List Your House</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
