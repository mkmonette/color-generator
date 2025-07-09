const Subscription = require('../models/Subscription')
const User = require('../models/User')
const mongoose = require('mongoose')

// GET /api/subscriptions
async function getSubscriptions(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10))
    const skip = (page - 1) * pageSize

    const filter = req.user.isAdmin ? {} : { user: req.user.id }
    const total = await Subscription.countDocuments(filter)
    const subscriptions = await Subscription.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)

    res.status(200).json({
      subscriptions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/subscriptions
async function subscribeUser(req, res) {
  let session
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { subscriptionType } = req.body
    if (!subscriptionType) {
      return res.status(400).json({ message: 'subscriptionType is required' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    let durationDays
    if (subscriptionType === 'monthly') {
      durationDays = 30
    } else if (subscriptionType === 'yearly') {
      durationDays = 365
    } else {
      return res.status(400).json({ message: 'Invalid subscriptionType' })
    }

    const now = new Date()
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

    session = await mongoose.startSession()
    session.startTransaction()

    await Subscription.updateMany(
      { user: user._id, status: 'active' },
      { $set: { status: 'canceled', endDate: now } },
      { session }
    )

    const [subscription] = await Subscription.create(
      [
        {
          user: user._id,
          subscriptionType,
          status: 'active',
          startDate: now,
          endDate
        }
      ],
      { session }
    )

    await session.commitTransaction()
    res.status(201).json({ subscription })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
    }
    console.error(error)
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' })
    }
  } finally {
    if (session) {
      session.endSession()
    }
  }
}

// DELETE /api/subscriptions/:id
async function cancelSubscription(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subscription ID' })
    }

    const subscription = await Subscription.findById(id)
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    if (!req.user.isAdmin && subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (subscription.status === 'canceled') {
      return res.status(400).json({ message: 'Subscription already canceled' })
    }

    subscription.status = 'canceled'
    subscription.endDate = new Date()
    await subscription.save()

    res.status(200).json({ message: 'Subscription canceled', subscription })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getSubscriptions,
  subscribeUser,
  cancelSubscription
}