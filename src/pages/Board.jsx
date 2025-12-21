import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import { supabase } from '../lib/supabase'
import FeedbackCard from '../components/FeedbackCard'
import FeedbackForm from '../components/FeedbackForm'
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

  if (!currentBoard) {
    return <div className="loading-page">Loading...</div>
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  return (
    <div className="board-page">
      <header className="board-header" style={{ background: currentBoard.accent_color || 'var(--primary)' }}>
        <div className="container">
          <div className="board-header-content">
            <div className="board-info">
              <h1>{currentBoard.title}</h1>
              {currentBoard.description && <p>{currentBoard.description}</p>}
            </div>
            <div className="board-actions">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to={`/${slug}/settings`} className="btn btn-secondary">
                      Settings
                    </Link>
                  )}
                  <button onClick={signOut} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/s/auth" className="btn btn-secondary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="board-main">
        <div className="container">
          <div className="board-toolbar">
            <div className="filters">
              <select
                className="input filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                className="input filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                className="input filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="votes">Most Votes</option>
                <option value="newest">Newest</option>
                <option value="comments">Most Comments</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Submit Feedback
            </button>
          </div>

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
    </div>
  )
}
