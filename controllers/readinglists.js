const router = require('express').Router()
const { ReadingList } = require('../models')
const { ValidationError } = require('sequelize')
const { tokenExtractor } = require('../util/middleware')

router.post('/', async (req, res, next) => {
  try {
    const { blog_id, user_id } = req.body
    const readingListEntry = await ReadingList.create({ blogId: blog_id, userId: user_id })
    res.json(readingListEntry)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const entry = await ReadingList.findByPk(req.params.id)
    if (!entry) {
      const err = new Error('reading list entry not found')
      err.name = 'NotFoundError'
      return next(err)
    }

    if (entry.userId !== req.decodedToken.id) {
      const err = new Error('forbidden: not your reading list entry')
      err.name = 'ForbiddenError'
      return next(err)
    }

    const { read } = req.body
    if (typeof read === 'undefined') {
      return next(new ValidationError('Validation error', [ { message: 'read field is required' } ]))
    }
    if (typeof read !== 'boolean') {
      return next(new ValidationError('Validation error', [ { message: 'read must be boolean' } ]))
    }

    entry.read = read
    await entry.save()
    return res.json({
      id: entry.id,
      user_id: entry.userId,
      blog_id: entry.blogId,
      read: entry.read
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router