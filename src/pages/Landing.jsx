import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Landing.css'

export default function Landing() {
  const { user, signOut } = useAuth()

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <nav className="landing-nav">
            <Link to="/" className="logo">Telloo</Link>
            <div className="nav-links">
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

        <section className="pricing">
          <div className="container">
            <h2>Simple Pricing</h2>
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
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 Telloo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
