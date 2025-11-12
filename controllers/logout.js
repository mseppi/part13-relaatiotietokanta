const router = require('express').Router()
const crypto = require('crypto')
const { Session } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.delete('/', tokenExtractor, async (req, res, next) => {
  try {
    const auth = req.get('authorization')
    const token = auth.substring(7)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const session = await Session.findOne({ where: { tokenHash, userId: req.decodedToken.id, active: true } })
    if (!session) {
      const err = new Error('session not found')
      err.name = 'NotFoundError'
      return next(err)
    }
    session.active = false
    session.revokedAt = new Date()
    await session.save()
    return res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router
