const ner = require('wink-ner')
const winkTokenizer = require('wink-tokenizer')
const req = require('./request')
const page = require('./request-page')
const n = ner()

const callAll = (page) => {
  console.log('calling ' + page)
  req(page).then(res => {
    console.log('end calling ' + page)
    const trainingData = res.results.filter(function(i) {
      return i.cnpj && {
        text: i.nome_socio,
        entityType: 'nome_socio',
        uid: i.id
      }
    })
    n.learn(trainingData)
    console.log('learned... calling next:::' + (page+1))
    callAll(page + 1)
  }).catch(() => {

    const tokenize = winkTokenizer().tokenize
    page().then(text => {
      var tokens = tokenize(text)
      tokens = n.recognize(tokens)
      tokens.forEach(token => {
        if (token.entityType) {
          console.log(token)
        }
      })
    })
  })
}

callAll(1)
