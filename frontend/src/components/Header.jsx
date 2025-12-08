import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Ginger<span>Easy</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Browse</Link>
          {isAuthenticated ? (
            <>
              <Link to="/create">List Your House</Link>
              <span className="nav-user">Hi, {user.username}</span>
              <button onClick={logout} className="nav-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-small">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
