import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './FeedbackForm.css'

const CATEGORIES = [
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'improvement', label: 'Improvement' },
]

export default function FeedbackForm({ boardId, onClose, onCreated }) {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('feature_request')
  const [authorName, setAuthorName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    setSubmitting(true)

    const postData = {
      board_id: boardId,
      title: title.trim(),
      description: description.trim(),
      category,
      user_id: user?.id || null,
      author_name: user ? (profile?.nickname || user.email.split('@')[0]) : (authorName.trim() || 'Anonymous'),
    }

    const { data, error: insertError } = await supabase
      .from('feedback_posts')
      .insert(postData)
      .select()

    console.log('Feedback submit result:', { data, error: insertError })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    onCreated()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal feedback-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Feedback</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="message message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!user && (
            <div className="form-group">
              <label className="form-label">Your Name (optional)</label>
              <input
                type="text"
                className="input"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Anonymous"
              />
              <p className="form-hint">Leave blank to post anonymously</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-buttons">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${category === cat.value ? 'active' : ''}`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your feedback..."
              rows={5}
              required
            />
          </div>

          {!user && (
            <p className="login-hint">
              <a href="/s/auth">Login</a> to attach images and vote on feedback
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
