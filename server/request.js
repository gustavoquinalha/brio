const request = require('request')

module.exports = (page) => {
  return new Promise((resolve, reject) => {
    request('http://brasil.io/api/dataset/socios-brasil/socios/data?format=json&page='+page, function (error, response, body) {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}