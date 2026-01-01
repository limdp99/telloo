import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import { supabase } from '../lib/supabase'
import './FeedbackDetailPanel.css'

const statusLabels = {
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
  considering: 'Considering',
}

const STATUSES = ['under_review', 'considering', 'planned', 'in_progress', 'completed', 'declined']

export default function FeedbackDetailPanel({ feedbackId, onClose, onUpdate }) {
  const { user } = useAuth()
  const { userRole } = useBoard()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (feedbackId) {
      loadData()
    }
  }, [feedbackId])

  const loadData = async () => {
    setLoading(true)
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
      onClose()
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
      voters: data.feedback_votes || [],
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

  const handleVote = async () => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    if (post.userVote === 'upvote') {
      await supabase
        .from('feedback_votes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    } else {
      if (post.userVote) {
        await supabase
          .from('feedback_votes')
          .update({ vote_type: 'upvote' })
          .eq('post_id', post.id)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('feedback_votes')
          .insert({
            post_id: post.id,
            user_id: user.id,
            vote_type: 'upvote',
          })
      }
    }

    fetchPost()
    onUpdate?.()
  }

  const handleStatusChange = async (newStatus) => {
    await supabase
      .from('feedback_posts')
      .update({ status: newStatus })
      .eq('id', post.id)

    fetchPost()
    onUpdate?.()
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} days ago`
    if (diffHours > 0) return `${diffHours} hours ago`
    return 'Just now'
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  if (loading || !post) {
    return (
      <>
        <div className="slide-panel-overlay" onClick={onClose} />
        <div className="slide-panel">
          <div className="panel-loading">Loading...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="slide-panel-overlay" onClick={onClose} />
      <div className="slide-panel">
        <div className="panel-header">
          <button className="panel-more-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          <button className="panel-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="panel-content">
          <h1 className="panel-title">
            {post.title}
            {post.ticket_number && <span className="ticket-number">#{post.ticket_number}</span>}
          </h1>

          <div className="panel-meta">
            <div className="meta-row">
              <span className="meta-label">Voters</span>
              <div className="meta-value voters">
                {post.voters.length > 0 ? (
                  <div className="voter-avatars">
                    {post.voters.slice(0, 3).map((voter, i) => (
                      <div key={i} className="voter-avatar">
                        {voter.user_id.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {post.voters.length > 3 && (
                      <div className="voter-avatar more">+{post.voters.length - 3}</div>
                    )}
                  </div>
                ) : (
                  <span className="empty">No voters yet</span>
                )}
              </div>
            </div>

            <div className="meta-row">
              <span className="meta-label">Status</span>
              <div className="meta-value">
                {isAdmin ? (
                  <select
                    className="status-select"
                    value={post.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="status-indicator">
                    <span className={`status-dot ${post.status.replace('_', '-')}`}></span>
                    {statusLabels[post.status]}
                  </span>
                )}
              </div>
            </div>

            <div className="meta-row">
              <span className="meta-label">Priority</span>
              <div className="meta-value">
                <span className="empty">Empty</span>
              </div>
            </div>

            <div className="meta-row">
              <span className="meta-label">Visibility</span>
              <div className="meta-value">
                <span className="visibility-public">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  Public
                </span>
              </div>
            </div>
          </div>

          <div className="panel-actions">
            <button className="action-btn subscribed">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Subscribed
            </button>
            <button
              className={`action-btn upvote ${post.userVote === 'upvote' ? 'active' : ''}`}
              onClick={handleVote}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Upvoted {post.upvotes}
            </button>
          </div>

          <div className="panel-description">
            <p>{post.description}</p>
            {post.image_url && (
              <div className="panel-image">
                <img
                  src={post.image_url}
                  alt="Attachment"
                  onClick={() => window.open(post.image_url, '_blank')}
                />
              </div>
            )}
            <div className="description-meta">
              <span>{post.author_name || 'Anonymous'}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>

          <div className="panel-comments">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.is_admin ? (
                    <div className="avatar admin">
                      <span>A</span>
                      <span className="admin-dot"></span>
                    </div>
                  ) : (
                    <div className="avatar">
                      {(comment.profiles?.nickname || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="comment-body">
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-meta">
                    <span className="comment-author">
                      {comment.profiles?.nickname || 'User'}
                    </span>
                    <span>·</span>
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <span>·</span>
                    <button className="comment-like">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <button className="comment-more">···</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-comment-form">
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment"
                  disabled={submitting}
                />
              </form>
            ) : (
              <div className="login-prompt">
                Login to leave a comment
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
