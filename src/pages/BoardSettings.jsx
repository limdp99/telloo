import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBoard } from '../context/BoardContext'
import './BoardSettings.css'

export default function BoardSettings() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { currentBoard, fetchBoardBySlug, updateBoard, userRole } = useBoard()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [accentColor, setAccentColor] = useState('#8b5cf6')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBoard()
  }, [slug])

  useEffect(() => {
    if (currentBoard) {
      setTitle(currentBoard.title)
      setDescription(currentBoard.description || '')
      setNewSlug(currentBoard.slug)
      setAccentColor(currentBoard.accent_color || '#8b5cf6')
    }
  }, [currentBoard])

  const loadBoard = async () => {
    if (!currentBoard || currentBoard.slug !== slug) {
      await fetchBoardBySlug(slug)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(newSlug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setSaving(true)

    const { error } = await updateBoard(currentBoard.id, {
      title: title.trim(),
      description: description.trim() || null,
      slug: newSlug,
      accent_color: accentColor,
    })

    if (error) {
      if (error.code === '23505') {
        setError('This URL is already taken')
      } else {
        setError(error.message)
      }
      setSaving(false)
      return
    }

    setSuccess('Settings saved!')
    setSaving(false)

    if (newSlug !== slug) {
      navigate(`/${newSlug}/settings`)
    }
  }

  if (!user) {
    navigate('/s/auth')
    return null
  }

  if (!currentBoard) {
    return <div className="loading-page">Loading...</div>
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || currentBoard.owner_id === user.id

  if (!isAdmin) {
    navigate(`/${slug}`)
    return null
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="container">
          <Link to={`/${slug}`} className="back-link">
            &larr; Back to {currentBoard.title}
          </Link>
        </div>
      </header>

      <main className="settings-main">
        <div className="container">
          <div className="settings-box">
            <h1>Board Settings</h1>

            {error && <div className="message message-error">{error}</div>}
            {success && <div className="message message-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Board Title</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <div className="slug-input">
                  <span className="slug-prefix">telloo.com/</span>
                  <input
                    type="text"
                    className="input"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
                <div
                  className="color-preview"
                  style={{ background: accentColor }}
                >
                  Preview Header
                </div>
              </div>

              <div className="form-actions">
                <Link to={`/${slug}`} className="btn btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
