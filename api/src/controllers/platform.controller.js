const axios = require('axios')
const { Platform } = require('../db.js')
const { API_BASE, API_KEY } = process.env
const url = (route) =>
  `${API_BASE}${route}?key=${API_KEY}`


async function getPlatformList(req, res, next) {
  try {
    const platformList = await Platform.findAll()
    res.json({ count: platformList.length, data: platformList })
  } catch (error) {
    next(error)
  }
}

async function preLoadPlatformList(req, res, next) {
  try {
    const urlCreated = url('/platforms');
    let { data: { results } } = await axios.get(urlCreated)
    results = results.map(async platform => {
      await Platform.findOrCreate({
        where: {
          id: platform.id,
          name: platform.name
        }
      })
    })
    // res.json({count: results.length, data: results})
    console.log('Platforms are loaded successfully')
  } catch (error) {
    next(error.message)
  }
}

module.exports = {
  preLoadPlatformList,
  getPlatformList,
}