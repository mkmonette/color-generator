const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const User = require('../models/userModel')

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error('Please provide email and password')
  }
  if (!validator.isEmail(email)) {
    res.status(400)
    throw new Error('Invalid email format')
  }
  const user = await User.findOne({ email })
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    res.status(400)
    throw new Error('Please provide username, email and password')
  }
  if (!validator.isEmail(email)) {
    res.status(400)
    throw new Error('Invalid email format')
  }
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    res.status(400)
    throw new Error(
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol'
    )
  }
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  })
  if (user) {
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  const { username, email, password } = req.body
  if (email) {
    if (!validator.isEmail(email)) {
      res.status(400)
      throw new Error('Invalid email format')
    }
    const emailUser = await User.findOne({ email })
    if (emailUser && emailUser._id.toString() !== req.user.id) {
      res.status(400)
      throw new Error('Email already in use')
    }
    user.email = email
  }
  if (username) {
    user.username = username
  }
  if (password) {
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      res.status(400)
      throw new Error(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol'
      )
    }
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
  }
  const updatedUser = await user.save()
  res.json({
    id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    token: generateToken(updatedUser._id),
  })
})

module.exports = {
  login,
  register,
  getUser,
  updateUser,
}