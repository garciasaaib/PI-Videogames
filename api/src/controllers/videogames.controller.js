const axios = require('axios')
const { Videogame, Genre, Platform, Op } = require('../db.js')
const { v4: uuidv4 } = require('uuid')
const { API_BASE, API_KEY } = process.env
const url = (route, query) =>
  `${API_BASE}${route}?${query ? 'search=' + query + '&' : ''}key=${API_KEY}`

/** Metodo para crear controller
 * crear la funcion asincrona estableciendo el nombre y los parametros de la petucion (req, res, next)
 * crear el manejador de error con try catch
 * catch manda al siguiente middleware
 * try obtiene la data y la manda como respuesta con res
 */

async function getVideogameList(req, res, next) {
  try {
    // CREATE URL
    //itera hasta que el array api videogames tenga la longitud de 100 o lo que venga en limit
    let apiVideogames = [] // juegos obtenidos en la
    const { name, limit = 100 } = req.query
    let nextUrl = url('/games', name)

    // API VIDEOGAMES 
    while (apiVideogames.length < limit) {
      let { data: { results, next } } = await axios.get(nextUrl)
      // da formato al resultado y lo agrega a la variable apiVideogames
      apiVideogames = apiVideogames.concat(results.map(
        (data) => {
          return {
            id: data.id,
            name: data.name,
            rating: data.rating,
            image: data.background_image,
            genres: data.genres.map(genre => ({
              id: genre.id,
              name: genre.name
            })),
            platforms: data.platforms.map(({ platform }) => ({
              id: platform.id,
              name: platform.name
            })),
          }
        }))
      // si no hay next sale del bucle, de lo contrario asigna el nuevo next
      if (!next) break;
      nextUrl = next
    }
    // DB VIDEOGAMES
    let dbOptions = {
      attributes: ["id", "name", "rating", "image"],
      include: [
        { model: Genre, through: { attributes: [] } },
        { model: Platform, through: { attributes: [] } }
      ]
    }
    if (name) dbOptions.where = {
      name: { [Op.iLike]: `%${name}` }
    }

    let dbVideogames = await Videogame.findAll(dbOptions)
    // ALL VIDEOGAMES & RESPONSE
    let allVideogames = dbVideogames.concat(apiVideogames)
    res.json({ api: apiVideogames.length, db: dbVideogames.length, data: allVideogames })
  } catch (error) { next(error.message) }
}


async function getVideogameById(req, res, next) {
  try {
    // URL AND ID VALIDATION
    let { id } = req.params, videogameDetail
    let urlCreated = url(`/games/${id}`)
    if (!isNaN(id)) {

      // API VIDEOGAME
      let { data } = await axios.get(urlCreated)
      videogameDetail = {
        id: data.id,
        name: data.name,
        description: data.description,
        rating: data.rating,
        released: data.released,
        image: data.background_image,
        platforms: data.platforms.map(({ platform }) => ({
          id: platform.id,
          name: platform.name
        })),
        genres: data.genres.map(genre => ({
          id: genre.id,
          name: genre.name
        }))
      }
    } else {
      videogameDetail = await Videogame.findByPk(id, {
        include: [
          // "genre"
          { model: Genre, through: { attributes: [] } },
          { model: Platform, through: { attributes: [] } }
        ]
      })
    }

    res.json({ data: videogameDetail })
  } catch (error) {
    next(error)
  }
}

async function createVideogame(req, res, next) {
  try {
    // CREATE URL
    const data = req.body
    const newVideogame = await Videogame.create({
      name: data.name,
      description: data.description,
      rating: data.rating,
      released: data.released,
      image: data.image,
    })
    await newVideogame.addGenre([...data.genres])
    await newVideogame.addPlatform([...data.platforms])
    res.json(newVideogame)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getVideogameList,
  getVideogameById,
  createVideogame,
}