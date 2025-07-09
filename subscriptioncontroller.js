const mongoose = require('mongoose')
const Subscription = require('../models/subscription')
const User = require('../models/user')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const createSubscription = async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body
    const userId = req.user.id

    // Validate input
    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      return res.status(400).json({ error: 'Invalid or missing planId' })
    }
    if (!paymentMethodId || typeof paymentMethodId !== 'string' || !paymentMethodId.trim()) {
      return res.status(400).json({ error: 'Invalid or missing paymentMethodId' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prevent duplicate active subscriptions
    const existing = await Subscription.findOne({
      user: userId,
      status: 'active'
    })
    if (existing) {
      return res.status(400).json({ error: 'An active subscription already exists for this user' })
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() }
      })
      customerId = customer.id
      user.stripeCustomerId = customerId
      await user.save()
    }

    // Attach and set default payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    })

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent']
    })

    // Persist to DB
    const newSub = await Subscription.create({
      user: userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      priceId: planId
    })

    // Extract client secret if available
    let clientSecret = null
    if (
      subscription.latest_invoice &&
      subscription.latest_invoice.payment_intent &&
      subscription.latest_invoice.payment_intent.client_secret
    ) {
      clientSecret = subscription.latest_invoice.payment_intent.client_secret
    }

    res.status(201).json({ subscription: newSub, clientSecret })
  } catch (err) {
    console.error('Create subscription error:', err)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
}

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params
    const userId = req.user.id

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return res.status(400).json({ error: 'Invalid subscription ID' })
    }

    const sub = await Subscription.findOne({ _id: subscriptionId, user: userId })
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    const canceled = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true
    })

    sub.status = canceled.status
    if (canceled.cancel_at) {
      sub.cancelAt = new Date(canceled.cancel_at * 1000)
    } else {
      sub.cancelAt = null
    }
    await sub.save()

    res.status(200).json({ message: 'Subscription canceled', subscription: sub })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
}

const getSubscriptions = async (req, res) => {
  try {
    let subs
    if (req.user.role === 'admin') {
      subs = await Subscription.find().populate('user', 'email')
    } else {
      subs = await Subscription.find({ user: req.user.id })
    }
    res.status(200).json({ subscriptions: subs })
  } catch (err) {
    console.error('Get subscriptions error:', err)
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
}

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptions
}