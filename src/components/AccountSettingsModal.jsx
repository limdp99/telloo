import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './AccountSettingsModal.css'

export default function AccountSettingsModal({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const fileInputRef = useRef(null)

  const [nickname, setNickname] = useState(profile?.nickname || user?.user_metadata?.nickname || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG, GIF, and WebP images are allowed' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB' })
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
    setMessage({ type: '', text: '' })
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    setAvatarUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!nickname.trim()) {
      setMessage({ type: 'error', text: 'Nickname is required' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      let newAvatarUrl = avatarUrl

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, avatarFile)

        if (uploadError) {
          throw new Error('Failed to upload avatar: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(fileName)

        newAvatarUrl = publicUrl
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            nickname: nickname.trim(),
            avatar_url: newAvatarUrl || null,
          })
          .eq('id', user.id)

        if (error) throw error
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            nickname: nickname.trim(),
            avatar_url: newAvatarUrl || null,
          })

        if (error) throw error
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: { nickname: nickname.trim() }
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      await refreshProfile()
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <h2>Account Settings</h2>
          <button className="account-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="account-modal-content">
          {/* Avatar Section */}
          <div className="account-field">
            <label>Profile Picture</label>
            <div className="avatar-edit-section">
              <div className="avatar-preview-large">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <span>{nickname?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="avatar-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    className="btn-text-danger"
                    onClick={handleRemoveAvatar}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nickname Section */}
          <div className="account-field">
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              type="text"
              className="account-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={50}
            />
          </div>

          {/* Email Section (read-only) */}
          <div className="account-field">
            <label>Email</label>
            <input
              type="text"
              className="account-input readonly"
              value={user?.email || ''}
              readOnly
            />
            <span className="field-hint">Email cannot be changed</span>
          </div>

          {message.text && (
            <div className={`account-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="account-modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
