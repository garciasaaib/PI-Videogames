const axios = require('axios')
const { Videogame, Genre, Platform, Op } = require('../db.js')
const { v4: uuidv4 } = require('uuid')
const { API_BASE, API_KEY } = process.env
const url = (route, query) =>
  `${API_BASE}${route}?${query ? 'search=' + query + '&' : ''}key=${API_KEY}`


// FORMAT API VIDEOGAMES
const formatApiVideogames = (array) => array.map(
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
  })


const giveOrder = async (allVideogames, order, rating) => {
  // ALFABETIC ORDER
  if (order === "des")
    allVideogames = await allVideogames.sort((a, b) =>
      b.name.toLowerCase().localCompare(a.name.toLowerCase()))
  else if (order === "asc")
    allVideogames = await allVideogames.sort((a, b) =>
      a.name.toLowerCase().localCompare(b.name.toLowerCase()))
  // RATING ORDER 
  if (rating === "des")
    allVideogames = await allVideogames.sort((a, b) =>
      b.rating.localCompare(a.rating))
  else if (rating === "asc")
    allVideogames = await allVideogames.sort((a, b) =>
      a.rating.localCompare(b.rating))
  return allVideogames
}
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
    let {
      // search
      name,
      // pagination
      page = 1,
      // order
      rating,
      order,
    } = req.query
    let videogamePerPage = 15,
      limit = 100,
      apiCalls = 0


    // DB VIDEOGAMES
    let dbOptions = {
      attributes: ["id", "name", "rating", "image"],
      include: [
        { model: Genre, through: { attributes: [] } },
        { model: Platform, through: { attributes: [] } }
      ]
    }
    if (name) dbOptions.where = { name: { [Op.iLike]: `%${name}` } }
    let dbVideogames = await Videogame.findAll(dbOptions)

    // HOW MANY API VIDEOGAMES DO I NEED
    /**
     * videogamePerPage = 15
     * page = 1
     * videogameLengthNeeded = videogamePerPage * page
     * 15 * 1 = 15
     * 
     * api = videogameLengthNeeded - dbVideogames.length
     * 14 = 15 - 1
     * 
     * apiVideogames.length = 20
     * 
     * 
     * apiVideogames.slice(0, 14).map()
     */

    // API VIDEOGAMES 
    let nextUrl = url('/games', name)
    console.log(nextUrl);
    for (let i = 0; i < 5; i++) {
      let { data: { results, next } } = await axios.get(nextUrl)
      // da formato al resultado y lo agrega a la variable apiVideogames
      // if(i === 4)
        apiVideogames = apiVideogames.concat(results)
      console.log(apiVideogames.length)

      

      // si no hay next sale del bucle, de lo contrario asigna el nuevo next
      if (!next) break;
      nextUrl = next
    }




    // ALL VIDEOGAMES
    let allVideogames = dbVideogames.concat(apiVideogames)


    // PAGINATION
    // page = page || 1
    // allVideogames = allVideogames
    //   .slice((videogamePerPage * (page - 1)), (videogamePerPage * (page - 1) + videogamePerPage))

    // RESPONSE
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