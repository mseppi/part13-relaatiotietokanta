const { ValidationError, DatabaseError } = require('sequelize')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' || error instanceof ValidationError) {
    return response.status(400).json({ error: error.message })
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
