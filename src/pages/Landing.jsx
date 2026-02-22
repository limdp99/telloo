import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Landing.css'

const DEMO_BOARD_ID = 'deadbeef-0000-0000-0000-000000000000'

const STATUS_LABELS = {
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

const CATEGORY_LABELS = {
  feature_request: 'Feature',
  bug_report: 'Bug',
  improvement: 'Improvement',
}

export default function Landing() {
  const { user, signOut } = useAuth()
  const [demoPosts, setDemoPosts] = useState([])

  useEffect(() => {
    fetchDemoPosts()
  }, [])

  const fetchDemoPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_posts')
        .select(`
          *,
          feedback_votes (vote_type),
          feedback_comments (count)
        `)
        .eq('board_id', DEMO_BOARD_ID)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Failed to fetch demo posts:', error)
        setDemoPosts(null)
        return
      }

      if (data) {
        const postsWithVotes = data.map(post => ({
          ...post,
          upvotes: post.feedback_votes?.filter(v => v.vote_type === 'upvote').length || 0,
          commentCount: post.feedback_comments?.[0]?.count || 0,
        }))
        setDemoPosts(postsWithVotes)
      } else {
        setDemoPosts(null)
      }
    } catch (err) {
      console.error('Failed to fetch demo posts:', err)
      setDemoPosts(null)
    }
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <nav className="landing-nav">
            <Link to="/" className="logo">Telloo</Link>
            <div className="nav-links">
              <a href="#pricing" className="btn btn-ghost">Pricing</a>
              {user ? (
                <>
                  <Link to="/s/dashboard" className="btn btn-ghost">Dashboard</Link>
                  <button onClick={signOut} className="btn btn-secondary">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/s/auth" className="btn btn-ghost">Login</Link>
                  <Link to="/s/auth?mode=signup" className="btn btn-primary">Get Started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>Collect & Prioritize User Feedback</h1>
            <p>
              Simple, affordable feedback management for your product.
              Let your users vote on features and track your roadmap.
            </p>
            <div className="hero-buttons">
              <Link to="/s/auth?mode=signup" className="btn btn-primary btn-lg">
                Start Free
              </Link>
              <Link to="/demo" className="btn btn-secondary btn-lg">
                View Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2>Everything you need</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Collect Feedback</h3>
                <p>Let users submit feature requests, bug reports, and improvements - even anonymously.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👍</div>
                <h3>Prioritize with Votes</h3>
                <p>Users can upvote feedback to help you understand what matters most.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Track Progress</h3>
                <p>Update statuses from Under Review to Completed and keep users informed.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Engage Users</h3>
                <p>Communicate directly with users through comments on feedback items.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-preview">
          <div className="container">
            <h2>See it in action</h2>
            <p className="section-subtitle">Real feedback from our demo board</p>

            {demoPosts === null ? (
              <div className="demo-loading">Could not load demo</div>
            ) : demoPosts.length > 0 ? (
              <div className="demo-cards">
                {demoPosts.map(post => (
                  <Link to="/demo" key={post.id} className="demo-card">
                    <div className="demo-card-header">
                      <span className={`demo-badge demo-badge-${post.category}`}>
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                      <span className={`demo-status demo-status-${post.status}`}>
                        {STATUS_LABELS[post.status] || post.status}
                      </span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.description?.slice(0, 100)}{post.description?.length > 100 ? '...' : ''}</p>
                    <div className="demo-card-footer">
                      <span className="demo-votes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {post.upvotes}
                      </span>
                      <span className="demo-comments">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {post.commentCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="demo-loading">Loading demo...</div>
            )}

            <div className="demo-cta">
              <Link to="/demo" className="btn btn-secondary btn-lg">
                Explore Demo Board
              </Link>
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="container">
            <h2>Simple Pricing</h2>
            <p className="section-subtitle">Start free, upgrade when you need more</p>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>Free</h3>
                <div className="price">$0<span>/month</span></div>
                <ul>
                  <li>1 Feedback Board</li>
                  <li>Unlimited Feedback</li>
                  <li>Voting System</li>
                  <li>Anonymous Submissions</li>
                </ul>
                <Link to="/s/auth?mode=signup" className="btn btn-secondary">Get Started</Link>
              </div>
              <div className="pricing-card featured">
                <h3>Pro</h3>
                <div className="price">$19.99<span>/month</span></div>
                <ul>
                  <li>3 Feedback Boards</li>
                  <li>Everything in Free</li>
                  <li>Custom Branding</li>
                  <li>Priority Support</li>
                </ul>
                <Link to="/s/auth?mode=signup" className="btn btn-primary">Get Started</Link>
              </div>
              <div className="pricing-card">
                <h3>Business</h3>
                <div className="price">$59.99<span>/month</span></div>
                <ul>
                  <li>10 Feedback Boards</li>
                  <li>Everything in Pro</li>
                  <li>Team Members</li>
                  <li>API Access</li>
                </ul>
                <Link to="/s/auth?mode=signup" className="btn btn-secondary">Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <h2>Start collecting feedback today</h2>
            <p>Free forever for 1 board. No credit card required.</p>
            <Link to="/s/auth?mode=signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2026 Telloo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
