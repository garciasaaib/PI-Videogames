const axios = require('axios')
const { Genre } = require('../db.js')
const { API_BASE, API_KEY } = process.env
const url = (route) =>
  `${API_BASE}${route}?key=${API_KEY}`


async function getGenreList(req, res, next) {
  try {
    const genreList = await Genre.findAll()
    res.json({count: genreList.length, data: genreList})
  } catch (error) {
    next(error)
  }
}

async function preLoadGenreList(req, res, next) {
  try {
    const urlCreated = url('/genres');
    let { data: { results } } = await axios.get(urlCreated)
    results = results.map(async genre => {
      await Genre.findOrCreate({
        where: {
          id: genre.id,
          name: genre.name
        }
      })
    })
    // res.json({info: results})
    console.log('Genres are loaded successfully')
  } catch (error) {
    next(error.message)
  }
}

module.exports = {
  preLoadGenreList,
  getGenreList,
}