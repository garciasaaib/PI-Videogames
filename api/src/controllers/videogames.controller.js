const axios = require('axios')
const { Videogame, Genre, Op } = require('../db.js')
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
    // console.log(limit)

    // API CHARACTERS 
    //itera hasta que el array api videogames tenga la longitud de 100 o lo que venga en limit
    let apiVideogames = [] // juegos obtenidos en la
    const { name, limit = 100 } = req.query
    let nextUrl = url('/games', name)

    while (apiVideogames.length < limit) {
      let { data: { results, next } } = await axios.get(nextUrl)
      // da formato al resultado y lo agrega a la variable apiVideogames
      apiVideogames = apiVideogames.concat(results.map(
        (data) => {
          return {
            id: data.id,
            name: data.name,
            image: data.background_image,
            genres: data.genres,
            rating: data.rating,
            platforms: data.platforms
          }
        }))
      // si no hay next sale del bucle, de lo contrario asigna el nuevo next
      if (!next) break;
      nextUrl = next
    }
    // DB CHARACTERS
    let dbVideogames = await Videogame.findAll(name && {
      where: {
        name: {
          [Op.iLike]: `%${name}`
        }
      }
    })
    // ALL CHARACTERS
    let allVideogames = dbVideogames.concat(apiVideogames)
    res.json({ api: apiVideogames.length, db: dbVideogames.length, data: allVideogames })
  } catch (error) { next(error.message) }

}
async function getVideogameById(req, res, next) {

}

async function createVideogame(req, res, next) {
  try {

  } catch (error) {

  }
}
module.exports = {
  getVideogameList,
  getVideogameById,
  createVideogame,
}