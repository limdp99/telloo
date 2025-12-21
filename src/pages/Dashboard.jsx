import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { boards, createBoard, loading } = useBoard()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !slug.trim()) {
      setError('Title and URL slug are required')
      return
    }

    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    const reservedSlugs = ['s', 'api', 'admin', 'auth', 'login', 'signup', 'pricing', 'super-admin', 'dashboard']
    if (reservedSlugs.includes(slug)) {
      setError('This URL is reserved. Please choose another.')
      return
    }

    setCreating(true)
    const { error } = await createBoard(title, description, slug)

    if (error) {
      if (error.code === '23505') {
        setError('This URL is already taken. Please choose another.')
      } else {
        setError(error.message)
      }
      setCreating(false)
      return
    }

    setShowCreate(false)
    setTitle('')
    setSlug('')
    setDescription('')
    setCreating(false)
  }

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(value)
  }

  if (!user) {
    navigate('/s/auth')
    return null
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <nav className="dashboard-nav">
            <Link to="/" className="logo">Telloo</Link>
            <div className="nav-links">
              <span className="user-email">{user.email}</span>
              <button onClick={signOut} className="btn btn-ghost">Logout</button>
            </div>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-title">
            <h1>Your Boards</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
              disabled={boards.length >= 1} // Free plan limit
            >
              Create Board
            </button>
          </div>

          {boards.length >= 1 && (
            <p className="plan-limit">Free plan allows 1 board. Upgrade for more.</p>
          )}

          {loading ? (
            <p className="loading">Loading...</p>
          ) : boards.length === 0 ? (
            <div className="empty-state">
              <h2>No boards yet</h2>
              <p>Create your first feedback board to start collecting user feedback.</p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create Your First Board
              </button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map(board => (
                <Link key={board.id} to={`/${board.slug}`} className="board-card">
                  <h3>{board.title}</h3>
                  <p>{board.description || 'No description'}</p>
                  <span className="board-url">telloo.com/{board.slug}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Board</h2>
            {error && <div className="message message-error">{error}</div>}

            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label className="form-label">Board Title</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Product Feedback"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <div className="slug-input">
                  <span className="slug-prefix">telloo.com/</span>
                  <input
                    type="text"
                    className="input"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="my-product"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="input textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share your ideas and vote on features"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
