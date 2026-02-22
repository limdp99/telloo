import { useState, useEffect, useRef } from 'react'
import { useBoard } from '../context/BoardContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './BoardSettingsModal.css'

const MENU_ITEMS = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'advanced', label: 'Advanced', icon: 'advanced' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'ja', label: '日本語' },
]

const COLOR_THEMES = [
  '#2dd4bf', // teal/mint
  '#22c55e', // green
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
]

export default function BoardSettingsModal({ onClose }) {
  const { currentBoard, updateBoard } = useBoard()
  const navigate = useNavigate()
  const logoInputRef = useRef(null)

  const [activeMenu, setActiveMenu] = useState('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('#2dd4bf')
  const [language, setLanguage] = useState('en')
  const [customDomain, setCustomDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentBoard) {
      setTitle(currentBoard.title || '')
      setDescription(currentBoard.description || '')
      setSlug(currentBoard.slug || '')
      setTheme(currentBoard.theme || 'dark')
      setAccentColor(currentBoard.accent_color || '#2dd4bf')
      setLanguage(currentBoard.language || 'en')
      setCustomDomain(currentBoard.custom_domain || '')
      setLogoUrl(currentBoard.logo_url || '')
      setLogoPreview(currentBoard.logo_url || '')
    }
  }, [currentBoard])

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setLogoUrl('')
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/
    if (!slugRegex.test(slug)) {
      setError('Slug must start and end with a letter or number')
      return
    }

    const reservedSlugs = ['s', 'api', 'admin', 'auth', 'login', 'signup', 'pricing', 'super-admin', 'dashboard', 'demo', '404', 'settings']
    if (reservedSlugs.includes(slug)) {
      setError('This URL is reserved. Please choose another.')
      return
    }

    setSaving(true)
    setError('')

    let newLogoUrl = logoUrl

    // Upload new logo if selected
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `logo-${currentBoard.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('feedback-images')
        .upload(fileName, logoFile)

      if (uploadError) {
        setError('Failed to upload logo: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('feedback-images')
        .getPublicUrl(fileName)

      newLogoUrl = publicUrl
    }

    const { error: updateError } = await updateBoard(currentBoard.id, {
      title: title.trim(),
      description: description.trim() || null,
      slug: slug,
      theme: theme,
      accent_color: accentColor,
      logo_url: newLogoUrl || null,
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

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setDeleting(true)

    const { error: deleteError } = await supabase
      .from('boards')
      .delete()
      .eq('id', currentBoard.id)

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }

    window.location.href = '/s/dashboard'
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
          <span className="label-title">Board Logo</span>
          <span className="label-desc">Upload a logo for your board</span>
        </div>
        <div className="settings-value">
          <div className="logo-edit-section">
            <div className="logo-preview" style={{ background: !logoPreview ? accentColor : 'transparent' }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" />
              ) : (
                <span>{title.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="logo-actions">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleLogoSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => logoInputRef.current?.click()}
              >
                Upload Logo
              </button>
              {logoPreview && (
                <button
                  type="button"
                  className="btn-text-danger"
                  onClick={handleRemoveLogo}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
          <span className="label-desc">telloo.io/{slug}</span>
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
          <span className="label-title">Theme</span>
          <span className="label-desc">Choose light or dark mode</span>
        </div>
        <div className="settings-value">
          <div className="theme-options">
            <button
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Light
            </button>
            <button
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Dark
            </button>
          </div>
        </div>
      </div>

      <div className="settings-row">
        <div className="settings-label">
          <span className="label-title">Accent color</span>
          <span className="label-desc">Primary color for buttons and links</span>
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
          <span className="label-desc">
            {showDeleteConfirm
              ? 'Are you sure? This action cannot be undone.'
              : 'Permanently delete this board and all its data'}
          </span>
        </div>
        <div className="settings-value delete-actions">
          {showDeleteConfirm && (
            <button
              className="cancel-delete-btn"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          )}
          <button
            className={`delete-board-btn ${showDeleteConfirm ? 'confirm' : ''}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : showDeleteConfirm ? 'Yes, Delete' : 'Delete Board'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeMenu) {
      case 'general':
        return renderGeneralSettings()
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
