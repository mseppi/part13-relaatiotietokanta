const router = require('express').Router()
const { User, Blog } = require('../models')


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

module.exports = router