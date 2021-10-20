const { Router } = require('express')
const videogamesController = require('../controllers/videogames.controller')
const router = Router()

router.get('/', videogamesController.getVideogameList)
router.get('/:id', videogamesController.getVideogameById)
router.get('/', videogamesController.createVideogame)

module.exports = router