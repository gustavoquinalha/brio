const request = require('request')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

module.exports = () => {
  return new Promise((resolve, reject) => {
    // const dom = new JSDOM(``, {
    //   url: "https://www.jusbrasil.com.br/topicos/40054972/rodolfo-nair-de-almeida-junior",
    //   referrer: "https://www.jusbrasil.com.br/topicos/40054972/rodolfo-nair-de-almeida-junior",
    //   contentType: "text/html",
    //   userAgent: "Mellblomenator/9000",
    //   includeNodeLocations: true,
    //   storageQuota: 10000000
    // })
    // console.log(dom.window.document.body.textContent)
    request('https://www.jusbrasil.com.br/topicos/40054972/rodolfo-nair-de-almeida-junior', function(error, response, body) {
      var mySubString = String(body).substring(
        String(body).indexOf("<body") + 1, 
        String(body).indexOf("</body")
      )
      fs.writeFileSync('./page.txt', mySubString)
      resolve(mySubString)
    })
  })
}