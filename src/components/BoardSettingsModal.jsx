import { useState, useEffect } from 'react'
import { useBoard } from '../context/BoardContext'
import { useNavigate } from 'react-router-dom'
import './BoardSettingsModal.css'

const MENU_ITEMS = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'people', label: 'People and privacy', icon: 'people' },
  { id: 'feedback', label: 'Feedback board', icon: 'feedback' },
  { id: 'advanced', label: 'Advanced', icon: 'advanced' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'ja', label: '日本語' },
]

const COLOR_THEMES = [
  '#2dd4bf', // mint
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#ef4444', // red
  '#f59e0b', // amber
]

const DEFAULT_VIEWS = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'roadmap', label: 'Roadmap' },
]

const DEFAULT_SORTS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_votes', label: 'Most Votes' },
]

export default function BoardSettingsModal({ onClose }) {
  const { currentBoard, updateBoard } = useBoard()
  const navigate = useNavigate()

  const [activeMenu, setActiveMenu] = useState('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [accentColor, setAccentColor] = useState('#2dd4bf')
  const [language, setLanguage] = useState('en')
  const [defaultView, setDefaultView] = useState('feedback')
  const [defaultSort, setDefaultSort] = useState('trending')
  const [customDomain, setCustomDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentBoard) {
      setTitle(currentBoard.title || '')
      setDescription(currentBoard.description || '')
      setSlug(currentBoard.slug || '')
      setAccentColor(currentBoard.accent_color || '#2dd4bf')
      setLanguage(currentBoard.language || 'en')
      setDefaultView(currentBoard.default_view || 'feedback')
      setDefaultSort(currentBoard.default_sort || 'trending')
      setCustomDomain(currentBoard.custom_domain || '')
    }
  }, [currentBoard])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setSaving(true)
    setError('')

    const { error: updateError } = await updateBoard(currentBoard.id, {
      title: title.trim(),
      description: description.trim() || null,
      slug: slug,
      accent_color: accentColor,
      custom_domain: customDomain.trim() || null,
    })

    if (updateError) {
      if (updateError.code === '23505') {
        setError('This URL is already taken')
      } else {
        setError(updateError.message)
      }
      setSaving(false)
      return
    }

    setSaving(false)

    if (slug !== currentBoard.slug) {
      navigate(`/${slug}`)
    }

    onClose()
  }

  const renderIcon = (icon) => {
    switch (icon) {
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )
      case 'people':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      case 'feedback':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      case 'advanced':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
      default:
        return null
    }
  }

  const renderGeneralSettings = () => (
    <div className="settings-content">
      <h2 className="settings-section-title">
        {renderIcon('settings')}
        General
      </h2>

      {error && <div className="settings-error">{error}</div>}

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Board Title</span>
          <span className="label-desc">The name of your feedback board</span>
        </div>
        <div className="settings-value">
          <input
            type="text"
            className="settings-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Board URL</span>
          <span className="label-desc">telloo.vercel.app/{slug}</span>
        </div>
        <div className="settings-value">
          <input
            type="text"
            className="settings-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Description</span>
          <span className="label-desc">A short description of your board</span>
        </div>
        <div className="settings-value">
          <textarea
            className="settings-input settings-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Language</span>
          <span className="label-desc">The language used on your board</span>
        </div>
        <div className="settings-value">
          <select
            className="settings-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Color theme</span>
          <span className="label-desc">Customize your board's design</span>
        </div>
        <div className="settings-value">
          <div className="color-options">
            {COLOR_THEMES.map(color => (
              <button
                key={color}
                className={`color-option ${accentColor === color ? 'active' : ''}`}
                style={{ background: color }}
                onClick={() => setAccentColor(color)}
              />
            ))}
            <input
              type="color"
              className="color-picker"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Default view</span>
          <span className="label-desc">When someone opens your board</span>
        </div>
        <div className="settings-value">
          <select
            className="settings-select"
            value={defaultView}
            onChange={(e) => setDefaultView(e.target.value)}
          >
            {DEFAULT_VIEWS.map(view => (
              <option key={view.value} value={view.value}>{view.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Default sort order</span>
          <span className="label-desc">How posts are sorted by default</span>
        </div>
        <div className="settings-value">
          <select
            className="settings-select"
            value={defaultSort}
            onChange={(e) => setDefaultSort(e.target.value)}
          >
            {DEFAULT_SORTS.map(sort => (
              <option key={sort.value} value={sort.value}>{sort.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderPeopleSettings = () => (
    <div className="settings-content">
      <h2 className="settings-section-title">
        {renderIcon('people')}
        People and privacy
      </h2>
      <div className="settings-placeholder">
        <p>Team member management coming soon.</p>
      </div>
    </div>
  )

  const renderFeedbackSettings = () => (
    <div className="settings-content">
      <h2 className="settings-section-title">
        {renderIcon('feedback')}
        Feedback board
      </h2>
      <div className="settings-placeholder">
        <p>Feedback board settings coming soon.</p>
      </div>
    </div>
  )

  const renderAdvancedSettings = () => (
    <div className="settings-content">
      <h2 className="settings-section-title">
        {renderIcon('advanced')}
        Advanced
      </h2>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Custom Domain</span>
          <span className="label-desc">Use your own domain for this board (e.g., feedback.yoursite.com)</span>
        </div>
        <div className="settings-value">
          <input
            type="text"
            className="settings-input"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            placeholder="feedback.yoursite.com"
          />
        </div>
      </div>

      {customDomain && (
        <div className="domain-instructions">
          <h4>DNS Configuration</h4>
          <p>Add the following CNAME record to your DNS settings:</p>
          <div className="dns-record">
            <div className="dns-row">
              <span className="dns-label">Type</span>
              <span className="dns-value">CNAME</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Name</span>
              <span className="dns-value">{customDomain.split('.')[0]}</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Value</span>
              <span className="dns-value">cname.vercel-dns.com</span>
            </div>
          </div>
          <p className="dns-note">After configuring DNS, it may take up to 48 hours for changes to propagate.</p>
        </div>
      )}

      <div className="settings-row danger-zone">
        <div className="settings-label">
          <span className="label-title danger">Delete Board</span>
          <span className="label-desc">Permanently delete this board and all its data</span>
        </div>
        <div className="settings-value">
          <button className="delete-board-btn">Delete Board</button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeMenu) {
      case 'general':
        return renderGeneralSettings()
      case 'people':
        return renderPeopleSettings()
      case 'feedback':
        return renderFeedbackSettings()
      case 'advanced':
        return renderAdvancedSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <>
      <div className="settings-modal-overlay" onClick={onClose} />
      <div className="settings-modal">
        <div className="settings-modal-header">
          <div className="settings-modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Board settings
          </div>
          <div className="settings-modal-actions">
            <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="settings-close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-modal-body">
          <div className="settings-sidebar">
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                className={`settings-menu-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                {renderIcon(item.icon)}
                {item.label}
              </button>
            ))}
          </div>

          <div className="settings-main">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  )
}
