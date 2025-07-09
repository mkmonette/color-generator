const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const MAX_PURCHASE = 1000;

async function purchaseCoins(req, res) {
  const userId = req.user && req.user.id;
  const amount = req.body.amount;

  if (!userId || !Number.isInteger(amount) || amount <= 0 || amount > MAX_PURCHASE) {
    return res.status(400).json({ success: false, message: 'Invalid user ID or amount' });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.coins = (user.coins || 0) + amount;
    await user.save({ session });

    const transaction = new Transaction({
      user: user._id,
      amount,
      type: 'purchase',
      date: new Date()
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, coins: user.coins });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }
      session.endSession();
    }
    console.error('purchaseCoins error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getUserCoins(req, res) {
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId).select('coins');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, coins: user.coins || 0 });
  } catch (error) {
    console.error('getUserCoins error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  purchaseCoins,
  getUserCoins
};