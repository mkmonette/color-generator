const express = require('express')
const bcrypt = require('bcryptjs')
const { check, validationResult, param } = require('express-validator')
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const permit = require('../middleware/permit')
const User = require('../models/User')
const router = express.Router()

// GET /api/users (admin only)
router.get('/', auth, permit('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/users (registration)
router.post(
  '/',
  [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    check('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number')
      .matches(/[\W_]/).withMessage('Password must contain a special character'),
    check('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { name, email, password, role = 'user' } = req.body
      const normalizedEmail = email.trim().toLowerCase()
      const existing = await User.findOne({ email: normalizedEmail })
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' })
      }
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)
      const user = new User({ name: name.trim(), email: normalizedEmail, password: hash, role })
      await user.save()
      const result = user.toObject()
      delete result.password
      res.status(201).json(result)
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({ message: 'Email already in use' })
      }
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// PUT /api/users/:id (admin only)
router.put(
  '/:id',
  auth,
  permit('admin'),
  [
    param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid user ID'),
    check('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    check('email').optional().normalizeEmail().isEmail().withMessage('Valid email is required'),
    check('password')
      .optional()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number')
      .matches(/[\W_]/).withMessage('Password must contain a special character'),
    check('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id } = req.params
      const updates = {}
      const { name, email, password, role } = req.body
      if (name) updates.name = name.trim()
      if (email) updates.email = email.trim().toLowerCase()
      if (role) updates.role = role
      if (password) {
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(password, salt)
      }
      const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password')
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json(user)
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({ message: 'Email already in use' })
      }
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// DELETE /api/users/:id (admin only)
router.delete(
  '/:id',
  auth,
  permit('admin'),
  [param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid user ID')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id } = req.params
      const user = await User.findByIdAndDelete(id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json({ message: 'User deleted' })
    } catch (err) {
      res.status(500).json({ message: 'Server error' })
    }
  }
)

module.exports = router