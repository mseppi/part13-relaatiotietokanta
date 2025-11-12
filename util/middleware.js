const { ValidationError, DatabaseError } = require('sequelize')
const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')
const crypto = require('crypto')
const { Session, User } = require('../models')

const tokenExtractor = async (req, res, next) => {
  const auth = req.get('authorization')
  if (!(auth && auth.toLowerCase().startsWith('bearer '))) {
    const err = new Error('token missing')
    err.name = 'TokenMissingError'
    return next(err)
  }

  const rawToken = auth.substring(7)
  try {
    req.decodedToken = jwt.verify(rawToken, SECRET)
  } catch (err) {
    return next(err)
  }
  
  try {
    const user = await User.findByPk(req.decodedToken.id)
    if (!user) {
      const err = new Error('user not found')
      err.name = 'NotFoundError'
      return next(err)
    }
    if (user.disabled) {
      const err = new Error('user disabled')
      err.name = 'ForbiddenError'
      return next(err)
    }
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const session = await Session.findOne({ where: { tokenHash, userId: user.id, active: true } })
    if (!session) {
      const err = new Error('session invalid or expired')
      err.name = 'TokenMissingError'
      return next(err)
    }
    req.session = session
    return next()
  } catch (error) {
    return next(error)
  }
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' || error instanceof ValidationError) {
    const messages = Array.isArray(error.errors) && error.errors.length > 0
      ? error.errors.map(e => e.message)
      : [error.message]

    return response.status(400).json({ error: messages })
  }

  if (error.name === 'SequelizeDatabaseError' || error instanceof DatabaseError) {
    return response.status(400).json({ error: 'database error' })
  }

  if (error.name === 'NotFoundError') {
    return response.status(404).json({ error: error.message })
  }

  if (error.name === 'ForbiddenError') {
    return response.status(403).json({ error: error.message })
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'TokenMissingError') {
    return response.status(401).json({ error: error.message || 'token invalid or missing' })
  }

  next(error)
}

module.exports = { errorHandler, tokenExtractor }
