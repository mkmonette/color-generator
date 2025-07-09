const mongoose = require('mongoose')
const Template = require('../models/templateModel')

const MAX_LIMIT = 100
const ALLOWED_SORT_FIELDS = ['name', 'createdAt', 'updatedAt']

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const getTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query

    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limNum = Math.min(Math.max(parseInt(limit, 10) || 1, 1), MAX_LIMIT)
    const skip = (pageNum - 1) * limNum

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'
    const sortOrder = order === 'asc' ? 1 : -1

    let filter = {}
    if (search) {
      const sanitized = escapeRegex(search)
      filter = { name: { $regex: sanitized, $options: 'i' } }
    }

    const total = await Template.countDocuments(filter)
    const templates = await Template.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limNum)
      .lean()

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limNum),
      data: templates
    })
  } catch (error) {
    console.error('getTemplates error:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' })
    }
    const template = await Template.findById(id).lean()
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' })
    }
    res.status(200).json({ success: true, data: template })
  } catch (error) {
    console.error('getTemplateById error:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

module.exports = {
  getTemplates,
  getTemplateById
}