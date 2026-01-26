import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './FeedbackForm.css'

const CATEGORIES = [
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'improvement', label: 'Improvement' },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function FeedbackForm({ boardId, onClose, onCreated }) {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('feature_request')
  const [authorName, setAuthorName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image size must be less than 5MB')
      return
    }

    setError('')
    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (postId) => {
    if (!imageFile || !user) return null

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${postId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('feedback-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('feedback-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

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

    // Upload image if exists
    if (imageFile && user && data?.[0]?.id) {
      const imageUrl = await uploadImage(data[0].id)
      if (imageUrl) {
        await supabase
          .from('feedback_posts')
          .update({ image_url: imageUrl })
          .eq('id', data[0].id)
      }
    }

    // Send notification to board admin for new post
    if (data?.[0]?.id) {
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'new_post',
            postId: data[0].id,
            triggeredBy: user?.id,
          }
        })
      } catch (error) {
        console.error('Failed to send notification:', error)
      }
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

          {user ? (
            <div className="form-group">
              <label className="form-label">Attachment (optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={removeImage}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Add screenshot</span>
                </button>
              )}
              <p className="form-hint">Max 5MB. Supports JPEG, PNG, GIF, WebP</p>
            </div>
          ) : (
            <p className="login-hint">
              <a href={`/s/auth?redirect=${encodeURIComponent(location.pathname)}`}>Login</a> to attach images and vote on feedback
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
