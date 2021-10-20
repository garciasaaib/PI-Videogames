const { Router } = require('express')
const platformController = require('../controllers/platform.controller')
const router = Router()

// router.get('/pre', platformController.preLoadPlatformList)
router.get('/', platformController.getPlatformList)

module.exports = router