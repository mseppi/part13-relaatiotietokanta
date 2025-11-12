const router = require('express').Router()
const { tokenExtractor } = require('../util/middleware')
const { Blog, User } = require('../models')
const { Op } = require('sequelize')


const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
    next()
  } catch (error) {
    next(error)
  }
}

router.get('/', async (req, res, next) => {
  const where = {}
  if (req.query.search) {
    const search = `%${req.query.search}%`
    where[Op.or] = [
      { title: { [Op.iLike]: search } },
      { author: { [Op.iLike]: search } }
    ]
  }
  try {
    const blogs = await Blog.findAll({
      include: {
        model: User,
        attributes: ['id', 'username', 'name']
      },
      where,
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
  } catch (error) {
    next(error)
  }
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, userId: user.id })
    const created = await Blog.findByPk(blog.id, {
      include: { model: User, attributes: ['id', 'username', 'name'] }
    })
    res.json(created)
  } catch(error) {
    next(error)
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  if (req.blog && req.blog.userId === req.decodedToken.id) {
    await req.blog.destroy()
  }
  res.status(204).end()
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    if (!req.blog) {
      const error = new Error('blog not found')
      error.name = 'NotFoundError'
      return next(error)
    }
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } catch (error) {
    next(error)
  }
})

module.exports = router
