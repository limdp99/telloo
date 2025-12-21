import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    setMode(searchParams.get('mode') || 'login')
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }
      if (!nickname.trim()) {
        setError('Nickname is required')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await signUp(email, password, nickname)
      if (signUpError) {
        setError(signUpError.message)
      } else if (data?.user) {
        // 바로 로그인 처리 (이메일 인증 비활성화 시)
        navigate('/s/dashboard')
        return
      }
    } else {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">Telloo</Link>

        <div className="auth-box">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to manage your feedback boards'
              : 'Start collecting user feedback today'}
          </p>

          {error && <div className="message message-error">{error}</div>}
          {message && <div className="message message-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Nickname</label>
                <input
                  type="text"
                  className="input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your display name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Link to="/s/auth?mode=signup">Sign up</Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/s/auth?mode=login">Sign in</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
