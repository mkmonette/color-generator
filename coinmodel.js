const User = require('../models/User');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
  }
}

class InsufficientCoinsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientCoinsError';
    this.code = 'INSUFFICIENT_COINS';
  }
}

async function addCoins(userId, amount) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new ValidationError('Invalid userId');
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('Amount to add must be a positive, finite number');
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { coins: amount } },
    { new: true }
  );

  if (!updatedUser) {
    throw new NotFoundError('Failed to add coins: User not found');
  }

  return updatedUser.coins;
}

async function subtractCoins(userId, amount) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new ValidationError('Invalid userId');
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('Amount to subtract must be a positive, finite number');
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  );

  if (updatedUser) {
    return updatedUser.coins;
  }

  const exists = await User.exists({ _id: userId });
  if (!exists) {
    throw new NotFoundError('Failed to subtract coins: User not found');
  }

  throw new InsufficientCoinsError('Failed to subtract coins: Insufficient balance');
}

module.exports = {
  addCoins,
  subtractCoins,
  ValidationError,
  NotFoundError,
  InsufficientCoinsError
};