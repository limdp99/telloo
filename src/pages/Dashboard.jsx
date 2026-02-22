import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

const PLAN_LIMITS = {
  free: 1,
  pro: 3,
  business: 10,
}

const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { boards, createBoard, loading } = useBoard()

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [subscription, setSubscription] = useState({ plan: 'free' })

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (data) {
      setSubscription(data)
    }
  }

  const boardLimit = PLAN_LIMITS[subscription.plan] || 1
  const canCreateBoard = boards.length < boardLimit

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
    return <Navigate to="/s/auth" replace />
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <nav className="dashboard-nav">
            <Link to="/" className="logo">Telloo</Link>
            <div className="nav-links">
              {/* TODO: 결제 기능 구현 후 활성화
              <Link to="/s/pricing" className={`plan-badge plan-${subscription.plan}`}>
                {PLAN_NAMES[subscription.plan]} Plan
              </Link>
              */}
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
            <div className="dashboard-actions">
              {/* TODO: 결제 기능 구현 후 활성화
              <span className="boards-count">{boards.length} / {boardLimit} boards</span>
              */}
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
                // disabled={!canCreateBoard} // TODO: 결제 기능 구현 후 활성화
              >
                Create Board
              </button>
            </div>
          </div>

          {/* TODO: 결제 기능 구현 후 활성화
          {!canCreateBoard && (
            <div className="plan-limit">
              <span>You've reached your {PLAN_NAMES[subscription.plan]} plan limit.</span>
              <Link to="/s/pricing" className="upgrade-link">Upgrade for more boards</Link>
            </div>
          )}
          */}

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
                  <span className="board-url">telloo.io/{board.slug}</span>
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
                  <span className="slug-prefix">telloo.io/</span>
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
