const { ValidationError, DatabaseError } = require('sequelize')

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

  next(error)
}

module.exports = { errorHandler }
