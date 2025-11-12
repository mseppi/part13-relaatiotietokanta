const router = require('express').Router()
const { User, Blog } = require('../models')
const { Op } = require('sequelize')


router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: {
                model: Blog,
                attributes: ['id','title','author','url','likes']
            }
        })
        res.json(users)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const user = await User.create(req.body)
        res.json(user)
    } catch (error) {
        next(error)
    }
})

router.put('/:username', async (req, res, next) => {
    try {
        req.user = await User.findOne({ where: { username: req.params.username } })
        if (!req.user) {
            const error = new Error('user not found')
            error.name = 'NotFoundError'
            return next(error)
        }
        req.user.name = req.body.name
        await req.user.save()
        res.json(req.user)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const where = {}
        if (req.query.read === 'true') {
            where.read = true
        } else if (req.query.read === 'false') {
            where.read = false
        }

        const user =  await User.findByPk(req.params.id, {
            include: {
                model: Blog,
                as: 'readinglists',
                attributes: ['id','title','author','url','likes', 'year'],
                through: {
                    attributes: ['id', 'read'],
                    where: Object.keys(where).length ? where : undefined
                }
            }
        })

        if (!user) {
            const error = new Error('user not found')
            error.name = 'NotFoundError'
            return next(error)
        }

        const readings = user.readinglists || []
        res.json({
            name: user.name,
            username: user.username,
            readings: readings.map(b => ({
                id: b.id,
                url: b.url,
                title: b.title,
                author: b.author,
                likes: b.likes,
                year: b.year,
                readinglists: [
                    {
                    read: b.readinglist.read,
                    id: b.readinglist.id
                    }
                ]
            }))
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router