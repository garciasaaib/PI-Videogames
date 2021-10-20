const { Router } = require('express')
const genreController = require('../controllers/genres.controller')
const router = Router()

// router.get('/pre', genreController.preLoadGenreList)
router.get('/', genreController.getGenreList)

module.exports = router