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

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote')
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="feedback-card">
      <div className="feedback-content" onClick={onClick} style={{ cursor: 'pointer' }}>
        <h3 className="feedback-title">
          {post.title}
          {post.ticket_number && <span className="ticket-number">#{post.ticket_number}</span>}
        </h3>
        <p className="feedback-description">{post.description}</p>

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
    </div>
  )
}
