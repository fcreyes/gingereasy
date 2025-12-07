import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/edit/:id" element={<CreateListing />} />
      </Routes>
    </div>
  )
}

export default App
