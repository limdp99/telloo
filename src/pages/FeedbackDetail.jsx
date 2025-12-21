import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import { supabase } from '../lib/supabase'
import './FeedbackDetail.css'

const categoryLabels = {
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  improvement: 'Improvement',
}

const statusLabels = {
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

const STATUSES = ['under_review', 'planned', 'in_progress', 'completed', 'declined']

export default function FeedbackDetail() {
  const { slug, feedbackId } = useParams()
  const { user, profile } = useAuth()
  const { currentBoard, fetchBoardBySlug, userRole } = useBoard()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [slug, feedbackId])

  const loadData = async () => {
    if (!currentBoard) {
      await fetchBoardBySlug(slug)
    }
    await fetchPost()
    await fetchComments()
    setLoading(false)
  }

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('feedback_posts')
      .select(`
        *,
        feedback_votes (vote_type, user_id)
      `)
      .eq('id', feedbackId)
      .single()

    if (error || !data) {
      navigate(`/${slug}`)
      return
    }

    const upvotes = data.feedback_votes?.filter(v => v.vote_type === 'upvote').length || 0
    const downvotes = data.feedback_votes?.filter(v => v.vote_type === 'downvote').length || 0
    const userVote = user
      ? data.feedback_votes?.find(v => v.user_id === user.id)?.vote_type || null
      : null

    setPost({
      ...data,
      upvotes,
      downvotes,
      voteScore: upvotes - downvotes,
      userVote,
    })
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('feedback_comments')
      .select(`
        *,
        profiles (nickname, avatar_url)
      `)
      .eq('post_id', feedbackId)
      .order('created_at', { ascending: true })

    setComments(data || [])
  }

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    if (post.userVote === voteType) {
      await supabase
        .from('feedback_votes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    } else if (post.userVote) {
      await supabase
        .from('feedback_votes')
        .update({ vote_type: voteType })
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('feedback_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          vote_type: voteType,
        })
    }

    fetchPost()
  }

  const handleStatusChange = async (newStatus) => {
    await supabase
      .from('feedback_posts')
      .update({ status: newStatus })
      .eq('id', post.id)

    fetchPost()
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)

    const isAdmin = userRole === 'admin' || userRole === 'super_admin'

    await supabase
      .from('feedback_comments')
      .insert({
        post_id: feedbackId,
        user_id: user.id,
        content: newComment.trim(),
        is_admin: isAdmin,
      })

    setNewComment('')
    setSubmitting(false)
    fetchComments()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading || !post) {
    return <div className="loading-page">Loading...</div>
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  return (
    <div className="detail-page">
      <header className="detail-header">
        <div className="container">
          <Link to={`/${slug}`} className="back-link">
            &larr; Back to {currentBoard?.title || 'Board'}
          </Link>
        </div>
      </header>

      <main className="detail-main">
        <div className="container">
          <div className="detail-layout">
            <div className="detail-content">
              <div className="post-detail">
                <div className="post-badges">
                  <span className={`badge badge-${post.category.replace('_', '-')}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <span className={`badge badge-${post.status.replace('_', '-')}`}>
                    {statusLabels[post.status]}
                  </span>
                </div>

                <h1>{post.title}</h1>

                <div className="post-meta">
                  <span className="post-author">{post.author_name || 'Anonymous'}</span>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                </div>

                <p className="post-description">{post.description}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="Feedback" className="post-image" />
                )}
              </div>

              <div className="comments-section">
                <h2>Comments ({comments.length})</h2>

                {user ? (
                  <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <textarea
                      className="input textarea"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>
                ) : (
                  <div className="login-prompt">
                    <Link to="/s/auth">Login</Link> to post comments
                  </div>
                )}

                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-comments">No comments yet</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className={`comment ${comment.is_admin ? 'admin-comment' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-author">
                            {comment.profiles?.nickname || 'User'}
                            {comment.is_admin && <span className="admin-badge">Admin</span>}
                          </span>
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="detail-sidebar">
              <div className="vote-box">
                <h3>Votes</h3>
                <div className="vote-controls">
                  <button
                    className={`vote-btn upvote ${post.userVote === 'upvote' ? 'active' : ''}`}
                    onClick={() => handleVote('upvote')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                    Upvote
                  </button>
                  <span className="vote-score">{post.voteScore}</span>
                  <button
                    className={`vote-btn downvote ${post.userVote === 'downvote' ? 'active' : ''}`}
                    onClick={() => handleVote('downvote')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    Downvote
                  </button>
                </div>
              </div>

              {isAdmin && (
                <div className="admin-box">
                  <h3>Admin Actions</h3>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={post.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
