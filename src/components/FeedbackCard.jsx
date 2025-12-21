import { Link } from 'react-router-dom'
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

export default function FeedbackCard({ post, boardSlug, onVoteChange }) {
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
      <div className="vote-section">
        <button
          className={`vote-btn upvote ${post.userVote === 'upvote' ? 'active' : ''}`}
          onClick={() => handleVote('upvote')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <span className="vote-count">{post.voteScore}</span>
        <button
          className={`vote-btn downvote ${post.userVote === 'downvote' ? 'active' : ''}`}
          onClick={() => handleVote('downvote')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      <Link to={`/${boardSlug}/feedback/${post.id}`} className="feedback-content">
        <div className="feedback-header">
          <span className={`badge badge-${post.category.replace('_', '-')}`}>
            {categoryLabels[post.category]}
          </span>
          <span className={`badge badge-${post.status.replace('_', '-')}`}>
            {statusLabels[post.status]}
          </span>
        </div>

        <h3 className="feedback-title">{post.title}</h3>
        <p className="feedback-description">{post.description}</p>

        <div className="feedback-footer">
          <span className="feedback-author">
            {post.author_name || 'Anonymous'}
          </span>
          <span className="feedback-meta">
            {formatDate(post.created_at)} · {post.commentCount} comments
          </span>
        </div>
      </Link>
    </div>
  )
}
