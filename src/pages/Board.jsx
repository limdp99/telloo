import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import { supabase } from '../lib/supabase'
import FeedbackCard from '../components/FeedbackCard'
import FeedbackForm from '../components/FeedbackForm'
import FeedbackDetailPanel from '../components/FeedbackDetailPanel'
import BoardSettingsModal from '../components/BoardSettingsModal'
import './Board.css'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'improvement', label: 'Improvement' },
]

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]

export default function Board() {
  const { slug } = useParams()
  const { user, signOut } = useAuth()
  const { currentBoard, fetchBoardBySlug, userRole } = useBoard()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('votes')
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    loadBoard()
  }, [slug])

  useEffect(() => {
    if (currentBoard) {
      fetchPosts()
    }
  }, [currentBoard, categoryFilter, statusFilter, sortBy])

  const loadBoard = async () => {
    const { error } = await fetchBoardBySlug(slug)
    if (error) {
      navigate('/404')
    }
  }

  const fetchPosts = async () => {
    let query = supabase
      .from('feedback_posts')
      .select(`
        *,
        feedback_votes (vote_type, user_id),
        feedback_comments (count)
      `)
      .eq('board_id', currentBoard.id)

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error) {
      // Calculate vote counts
      const postsWithVotes = data.map(post => {
        const upvotes = post.feedback_votes?.filter(v => v.vote_type === 'upvote').length || 0
        const downvotes = post.feedback_votes?.filter(v => v.vote_type === 'downvote').length || 0
        const userVote = user
          ? post.feedback_votes?.find(v => v.user_id === user.id)?.vote_type || null
          : null

        return {
          ...post,
          upvotes,
          downvotes,
          voteScore: upvotes - downvotes,
          userVote,
          commentCount: post.feedback_comments?.[0]?.count || 0,
        }
      })

      // Sort
      if (sortBy === 'votes') {
        postsWithVotes.sort((a, b) => b.voteScore - a.voteScore)
      } else if (sortBy === 'newest') {
        postsWithVotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else if (sortBy === 'comments') {
        postsWithVotes.sort((a, b) => b.commentCount - a.commentCount)
      }

      setPosts(postsWithVotes)
    }
    setLoading(false)
  }

  const handlePostCreated = () => {
    setShowForm(false)
    fetchPosts()
  }

  const handleVoteChange = () => {
    fetchPosts()
  }

  const handleFeedbackClick = (postId) => {
    setSelectedFeedbackId(postId)
  }

  const handlePanelClose = () => {
    setSelectedFeedbackId(null)
  }

  if (!currentBoard) {
    return <div className="loading-page">Loading...</div>
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  return (
    <div className="board-page">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="top-nav-content">
          <div className="top-nav-left">
            <Link to="/dashboard" className="nav-logo">Telloo</Link>
          </div>
          <div className="top-nav-right">
            {isAdmin && (
              <button onClick={() => setShowSettings(true)} className="nav-link">
                Settings
              </button>
            )}
            {user ? (
              <div className="profile-menu-wrapper">
                <button
                  className="profile-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="profile-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </button>
                {showProfileMenu && (
                  <>
                    <div className="profile-menu-overlay" onClick={() => setShowProfileMenu(false)} />
                    <div className="profile-menu">
                      <div className="profile-menu-header">
                        <span className="profile-email">{user.email}</span>
                      </div>
                      <div className="profile-menu-divider" />
                      <Link to="/dashboard" className="profile-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      <button onClick={signOut} className="profile-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/s/auth" className="nav-link">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Board Header Card */}
      <div className="board-header-wrapper">
        <div className="container">
          <div className="board-header-card">
            <div className="board-logo" style={{ background: currentBoard.accent_color || 'var(--primary)' }}>
              {currentBoard.title.charAt(0).toUpperCase()}
            </div>
            <div className="board-info">
              <h1>{currentBoard.title}</h1>
              {currentBoard.description && <p>{currentBoard.description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="board-toolbar-wrapper">
        <div className="container">
          <div className="board-toolbar">
            <div className="toolbar-left">
              <div className="sort-dropdown">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="votes">Trending</option>
                  <option value="newest">Newest</option>
                  <option value="comments">Most Discussed</option>
                </select>
              </div>
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Make a suggestion
            </button>
          </div>
        </div>
      </div>

      <main className="board-main">
        <div className="container">

          {loading ? (
            <p className="loading-text">Loading feedback...</p>
          ) : posts.length === 0 ? (
            <div className="empty-posts">
              <h2>No feedback yet</h2>
              <p>Be the first to submit feedback!</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Submit Feedback
              </button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <FeedbackCard
                  key={post.id}
                  post={post}
                  boardSlug={slug}
                  onVoteChange={handleVoteChange}
                  onClick={() => handleFeedbackClick(post.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <FeedbackForm
          boardId={currentBoard.id}
          onClose={() => setShowForm(false)}
          onCreated={handlePostCreated}
        />
      )}

      {selectedFeedbackId && (
        <FeedbackDetailPanel
          feedbackId={selectedFeedbackId}
          onClose={handlePanelClose}
          onUpdate={fetchPosts}
        />
      )}

      {showSettings && (
        <BoardSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
