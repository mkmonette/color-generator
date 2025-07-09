import React, { useState, useEffect, useRef } from 'react'

interface Plan {
  id: string
  name: string
  price: number
  description: string
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  userCoins: number
  onSubscriptionSuccess?: (planId: string) => void
}

const plans: Plan[] = [
  { id: 'basic', name: 'Basic', price: 10, description: 'Access to basic features.' },
  { id: 'pro', name: 'Pro', price: 50, description: 'Unlimited palettes, advanced editing.' },
  { id: 'enterprise', name: 'Enterprise', price: 100, description: 'All features, priority support.' },
]

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  onSubscriptionSuccess,
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setLoadingPlan(null)
      previouslyFocusedElement.current = document.activeElement as HTMLElement
      // Focus first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        focusable?.[0]?.focus()
      }, 0)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable && focusable.length > 0) {
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault()
              last.focus()
            }
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        previouslyFocusedElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  const handleSubscribe = async (planId: string): Promise<void> => {
    const selectedPlan = plans.find(p => p.id === planId)
    if (!selectedPlan) {
      setError('Invalid plan selected.')
      return
    }
    if (userCoins < selectedPlan.price) {
      setError('Insufficient coins for this plan.')
      return
    }
    setError(null)
    setLoadingPlan(planId)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      if (!response.ok) {
        let errorMessage = 'Subscription failed.'
        try {
          const data = await response.json()
          if (data && data.message) {
            errorMessage = data.message
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(errorMessage)
      }
      onSubscriptionSuccess?.(planId)
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoadingPlan(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 id="subscription-modal-title">Choose Your Plan</h2>
        {error && <div className="modal-error" role="alert">{error}</div>}
        <div className="plans-container">
          {plans.map(plan => {
            const cannotAfford = userCoins < plan.price
            const isLoading = loadingPlan === plan.id
            return (
              <div key={plan.id} className="plan-card">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <div className="plan-price">{plan.price} coins</div>
                <button
                  className="plan-button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || cannotAfford}
                >
                  {isLoading ? 'Processing...' : cannotAfford ? 'Insufficient Coins' : 'Subscribe'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal