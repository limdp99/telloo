import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Pricing.css'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'For personal projects',
    features: [
      '1 feedback board',
      'Unlimited feedback posts',
      'Basic analytics',
      'Community support',
    ],
    limits: {
      boards: 1,
    },
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    period: 'month',
    description: 'For growing teams',
    features: [
      '3 feedback boards',
      'Custom branding',
      'Priority support',
      'Advanced analytics',
      'Export data (CSV)',
    ],
    limits: {
      boards: 3,
    },
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 59.99,
    period: 'month',
    description: 'For larger organizations',
    features: [
      '10 feedback boards',
      'Custom domain',
      'Team members',
      'API access',
      'SSO integration',
      'Dedicated support',
    ],
    limits: {
      boards: 10,
    },
    cta: 'Start Business Trial',
    popular: false,
  },
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free')

  const handleSelectPlan = async (planId) => {
    if (!user) {
      navigate('/s/auth?redirect=/pricing')
      return
    }

    if (planId === 'free') {
      navigate('/s/dashboard')
      return
    }

    setLoading(planId)

    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId }
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="pricing-page">
      <nav className="pricing-nav">
        <Link to="/" className="nav-logo">Telloo</Link>
        <div className="nav-links">
          {user ? (
            <Link to="/s/dashboard" className="nav-link">Dashboard</Link>
          ) : (
            <Link to="/s/auth" className="nav-link">Login</Link>
          )}
        </div>
      </nav>

      <main className="pricing-main">
        <div className="pricing-header">
          <h1>Simple, transparent pricing</h1>
          <p>Choose the plan that fits your needs. Upgrade or downgrade anytime.</p>
        </div>

        <div className="pricing-cards">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}

              <div className="plan-header">
                <h2>{plan.name}</h2>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-price">
                <span className="price-amount">${plan.price}</span>
                {plan.price > 0 && <span className="price-period">/{plan.period}</span>}
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading === plan.id || currentPlan === plan.id}
              >
                {loading === plan.id ? 'Loading...' : currentPlan === plan.id ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I change plans later?</h3>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>

            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards through our secure payment processor, Stripe.</p>
            </div>

            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>Yes, Pro and Business plans come with a 14-day free trial. No credit card required to start.</p>
            </div>

            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Absolutely. Cancel your subscription at any time with no questions asked.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="pricing-footer">
        <p>&copy; 2026 Telloo. All rights reserved.</p>
      </footer>
    </div>
  )
}
