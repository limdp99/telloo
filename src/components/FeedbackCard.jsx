import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './FeedbackCard.css'

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

export default function FeedbackCard({ post, boardSlug, onVoteChange, onClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleVote = async (voteType) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (post.userVote === voteType) {
      // Remove vote
      await supabase
        .from('feedback_votes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    } else if (post.userVote) {
      // Change vote
      await supabase
        .from('feedback_votes')
        .update({ vote_type: voteType })
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    } else {
      // New vote
      await supabase
        .from('feedback_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          vote_type: voteType,
        })
    }

    onVoteChange()
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="feedback-card">
      <div className="feedback-content" onClick={onClick} style={{ cursor: 'pointer' }}>
        <h3 className="feedback-title">
          {post.title}
          {post.ticket_number && <span className="ticket-number">#{post.ticket_number}</span>}
        </h3>
        <p className="feedback-description">{post.description}</p>

        {post.image_url && (
          <div className="feedback-image">
            <img src={post.image_url} alt="Attachment" />
          </div>
        )}

        <div className="feedback-footer">
          <div className="feedback-status-row">
            <span className={`status-indicator status-${post.status.replace('_', '-')}`}>
              {statusLabels[post.status]}
            </span>
            {post.priority && post.priority !== 'empty' && (
              <span className={`priority-indicator priority-${post.priority}`}>
                {post.priority}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="vote-section">
        <button
          className={`vote-btn ${post.userVote === 'upvote' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            handleVote('upvote')
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{post.upvotes}</span>
        </button>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Login Required</h3>
            <p>Please login to vote on this feedback.</p>
            <div className="login-modal-actions">
              <button className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => navigate(`/s/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`)}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
