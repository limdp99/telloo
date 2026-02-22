import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

const PRIORITIES = [
  { value: 'empty', label: 'Empty' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function FeedbackDetailPanel({ feedbackId, onClose, onUpdate }) {
  const { user, profile } = useAuth()
  const { userRole } = useBoard()
  const navigate = useNavigate()
  const location = useLocation()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showVotersList, setShowVotersList] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')
  const [commentImage, setCommentImage] = useState(null)
  const [commentImagePreview, setCommentImagePreview] = useState(null)
  const [imageModalUrl, setImageModalUrl] = useState(null)

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

  const sendNotification = async (type, data = {}) => {
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          type,
          postId: feedbackId,
          triggeredBy: user?.id,
          ...data
        }
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
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

    // Fetch voter profiles
    const voterIds = data.feedback_votes?.map(v => v.user_id) || []
    let voterProfiles = {}
    if (voterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', voterIds)

      if (profiles) {
        voterProfiles = profiles.reduce((acc, p) => {
          acc[p.id] = { nickname: p.nickname, avatar_url: p.avatar_url }
          return acc
        }, {})
      }
    }

    const upvotes = data.feedback_votes?.filter(v => v.vote_type === 'upvote').length || 0
    const downvotes = data.feedback_votes?.filter(v => v.vote_type === 'downvote').length || 0
    const userVote = user
      ? data.feedback_votes?.find(v => v.user_id === user.id)?.vote_type || null
      : null

    const votersWithProfiles = (data.feedback_votes || []).map(v => ({
      ...v,
      nickname: voterProfiles[v.user_id]?.nickname || 'Anonymous',
      avatar_url: voterProfiles[v.user_id]?.avatar_url || null
    }))

    setPost({
      ...data,
      upvotes,
      downvotes,
      voteScore: upvotes - downvotes,
      userVote,
      voters: votersWithProfiles,
    })
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('feedback_comments')
      .select(`
        *,
        profiles!fk_feedback_comments_user (nickname, avatar_url),
        comment_likes (user_id)
      `)
      .eq('post_id', feedbackId)
      .order('created_at', { ascending: true })

    const commentsWithLikes = (data || []).map(comment => ({
      ...comment,
      likeCount: comment.comment_likes?.length || 0,
      userLiked: user ? comment.comment_likes?.some(like => like.user_id === user.id) : false
    }))

    setComments(commentsWithLikes)
  }

  const handleCommentLike = async (commentId, currentlyLiked) => {
    if (!user) {
      setLoginModalMessage('Please login to like comments.')
      setShowLoginModal(true)
      return
    }

    if (currentlyLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        })
    }

    fetchComments()
  }

  const handleVote = async () => {
    if (!user) {
      setLoginModalMessage('Please login to vote on this feedback.')
      setShowLoginModal(true)
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
    const { error } = await supabase
      .from('feedback_posts')
      .update({ status: newStatus })
      .eq('id', post.id)

    if (!error) {
      sendNotification('status_change', { newStatus })
    }

    fetchPost()
    onUpdate?.()
  }

  const handlePriorityChange = async (newPriority) => {
    await supabase
      .from('feedback_posts')
      .update({ priority: newPriority })
      .eq('id', post.id)

    fetchPost()
    onUpdate?.()
  }

  const handleCommentImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setCommentImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setCommentImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeCommentImage = () => {
    setCommentImage(null)
    setCommentImagePreview(null)
  }

  const uploadCommentImage = async (commentId, imageFile) => {
    if (!imageFile || !user) {
      return null
    }

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `comment-${commentId}-${Date.now()}.${fileExt}`

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if ((!newComment.trim() && !commentImage) || !user) return

    setSubmitting(true)

    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    const commentContent = newComment.trim()

    // Save before clearing - for optimistic update and upload
    const savedImagePreview = commentImagePreview
    const savedImageFile = commentImage

    // Clear form immediately for better UX
    setNewComment('')
    setCommentImage(null)
    setCommentImagePreview(null)

    // Show optimistic comment with local preview immediately
    const tempId = `temp-${Date.now()}`
    const optimisticComment = {
      id: tempId,
      content: commentContent,
      image_url: savedImagePreview, // Use saved local preview (base64)
      is_admin: isAdmin,
      created_at: new Date().toISOString(),
      profiles: {
        nickname: profile?.nickname || user.user_metadata?.nickname || 'User',
        avatar_url: profile?.avatar_url || null
      },
      likeCount: 0,
      userLiked: false,
    }
    setComments(prev => [...prev, optimisticComment])

    // Upload image if exists
    let imageUrl = null
    if (savedImageFile) {
      imageUrl = await uploadCommentImage(tempId, savedImageFile)
    }

    const { data, error } = await supabase
      .from('feedback_comments')
      .insert({
        post_id: feedbackId,
        user_id: user.id,
        content: commentContent,
        is_admin: isAdmin,
        image_url: imageUrl,
      })
      .select()

    if (error) {
      console.error('Comment insert error:', error)
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== tempId))
      alert('Failed to post comment: ' + error.message)
      setSubmitting(false)
      return
    }

    // Update optimistic comment with real data
    setComments(prev => prev.map(c =>
      c.id === tempId
        ? { ...c, id: data[0].id, image_url: imageUrl || savedImagePreview }
        : c
    ))

    // Send notification for new comment
    sendNotification('new_comment', { commentContent })

    setSubmitting(false)
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
                  <div className="voters-wrapper">
                    <button
                      className="voter-avatars-btn"
                      onClick={() => setShowVotersList(!showVotersList)}
                    >
                      <div className="voter-avatars">
                        {post.voters.slice(0, 3).map((voter, i) => (
                          <div key={i} className="voter-avatar">
                            {voter.avatar_url ? (
                              <img src={voter.avatar_url} alt="" className="voter-avatar-img" />
                            ) : (
                              (voter.nickname || 'A').charAt(0).toUpperCase()
                            )}
                          </div>
                        ))}
                        {post.voters.length > 3 && (
                          <div className="voter-avatar more">+{post.voters.length - 3}</div>
                        )}
                      </div>
                      <span className="voters-count">{post.voters.length} voters</span>
                    </button>
                    {showVotersList && (
                      <>
                        <div className="voters-list-overlay" onClick={() => setShowVotersList(false)} />
                        <div className="voters-list-popover">
                          <div className="voters-list-header">
                            <span>Voters ({post.voters.length})</span>
                            <button onClick={() => setShowVotersList(false)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="voters-list-content">
                            {post.voters.map((voter, i) => (
                              <div key={i} className="voter-item">
                                <div className="voter-item-avatar">
                                  {voter.avatar_url ? (
                                    <img src={voter.avatar_url} alt="" className="voter-item-avatar-img" />
                                  ) : (
                                    (voter.nickname || 'A').charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="voter-item-name">{voter.nickname || 'Anonymous'}</span>
                                <span className={`voter-item-type ${voter.vote_type}`}>
                                  {voter.vote_type === 'upvote' ? '+1' : '-1'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
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
                {isAdmin ? (
                  <select
                    className="priority-select"
                    value={post.priority || 'empty'}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  post.priority && post.priority !== 'empty' ? (
                    <span className={`priority-badge priority-${post.priority}`}>
                      {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)}
                    </span>
                  ) : (
                    <span className="empty">Empty</span>
                  )
                )}
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
                  onClick={() => setImageModalUrl(post.image_url)}
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
                  {comment.profiles?.avatar_url ? (
                    <div className={`avatar ${comment.is_admin ? 'admin' : ''}`}>
                      <img src={comment.profiles.avatar_url} alt="" className="avatar-img" />
                      {comment.is_admin && <span className="admin-dot"></span>}
                    </div>
                  ) : comment.is_admin ? (
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
                  {comment.content && <p className="comment-text">{comment.content}</p>}
                  {comment.image_url && (
                    <div className="comment-image">
                      <img src={comment.image_url} alt="Comment attachment" onClick={() => setImageModalUrl(comment.image_url)} />
                    </div>
                  )}
                  <div className="comment-meta">
                    <span className="comment-author">
                      {comment.profiles?.nickname || 'User'}
                    </span>
                    <span>·</span>
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <span>·</span>
                    <button
                      className={`comment-like ${comment.userLiked ? 'liked' : ''}`}
                      onClick={() => handleCommentLike(comment.id, comment.userLiked)}
                    >
                      <svg viewBox="0 0 24 24" fill={comment.userLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                    </button>
                    <button className="comment-more">···</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-comment-form">
          {user ? (
            <form onSubmit={handleCommentSubmit}>
              {commentImagePreview && (
                <div className="comment-image-preview">
                  <img src={commentImagePreview} alt="Preview" />
                  <button type="button" className="remove-image-btn" onClick={removeCommentImage}>×</button>
                </div>
              )}
              <div className="comment-input-row">
                <input
                  type="text"
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment"
                  disabled={submitting}
                />
                <label className="comment-image-btn">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleCommentImageSelect}
                    style={{ display: 'none' }}
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </label>
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={submitting || (!newComment.trim() && !commentImage)}
                >
                  {submitting ? '...' : '→'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <a href={`/s/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`}>Login</a> to leave a comment
            </div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Login Required</h3>
            <p>{loginModalMessage}</p>
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

      {imageModalUrl && (
        <div className="image-modal-overlay" onClick={() => setImageModalUrl(null)}>
          <button className="image-modal-close" onClick={() => setImageModalUrl(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img
            src={imageModalUrl}
            alt="Full size"
            className="image-modal-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
