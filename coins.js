const mongoose = require('mongoose')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

async function getCoins(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const user = await User.findById(userId).select('coins')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ coins: user.coins })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function updateCoins(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const { amount, action } = req.body
    const value = Number(amount)
    if (!['add', 'subtract', 'set'].includes(action) || isNaN(value) || value < 0 || !Number.isInteger(value)) {
      return res.status(400).json({ error: 'Invalid action or amount' })
    }

    const session = await mongoose.startSession()
    try {
      session.startTransaction()

      const user = await User.findById(userId).session(session)
      if (!user) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({ error: 'User not found' })
      }

      let newBalance
      if (action === 'add') {
        newBalance = user.coins + value
      } else if (action === 'subtract') {
        if (user.coins < value) {
          await session.abortTransaction()
          session.endSession()
          return res.status(400).json({ error: 'Insufficient coins' })
        }
        newBalance = user.coins - value
      } else {
        newBalance = value
      }

      user.coins = newBalance
      await user.save({ session })
      await Transaction.create(
        [{
          user: userId,
          action,
          amount: value,
          balanceAfter: newBalance,
          createdAt: new Date()
        }],
        { session }
      )

      await session.commitTransaction()
      session.endSession()

      res.status(200).json({ coins: newBalance })
    } catch (err) {
      await session.abortTransaction()
      session.endSession()
      throw err
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getCoins, updateCoins }