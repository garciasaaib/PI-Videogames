const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const genreRouter = require('./genre')
const videogameRouter = require('./videogame')
const platformRouter = require('./platform')

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/genre', genreRouter)
router.use('/videogame', videogameRouter)
router.use('/platform', platformRouter)


module.exports = router;
