document.addEventListener('DOMContentLoaded', function(){
  tippy(document.querySelector('#myElement'), {
    delay: 100,
    arrow: true,
    interactive: true,
    html: '#myTemplate'
    // trigger: 'click'
  });
});

//Regex pattern para identificar nomes em textos
const rgNames = /([A-Z]+\w{3,12})+?(\s[A-Z]\w{3,12})?(\s[A-Z]\w{3,12})?(\s[A-Z]\w{3,12})/g;

//Regex pattern para identificar CNPJS em textos
const rgCNPJS = /(\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2})/g;

/**
 * Names dataset placeholder
 * 
 */
var names = [
  'Jair Bolsonaro',
  'Ciro Gomes',
  'Dilma Rouseff',
  'Lula',
  'Luis Inácio Lula da Silva',
  'Aécio Neves',
  'Mariana Davilla',
  'Marina da Silva',
  //
  'Marco Antonio',
  'Bolsonaro',
  'Itamaraty'
]

var dataBrasilIo = [];

/**
 * @name    search: return all elements that contains the name
 *
 * @params  node: HTMLBodyElement
 *          name: String
 *
 * @return  [...HTMLBaseElement]
 * 
 */
var search = function(node, name) {
	var catches = [];
	var __search = function(node) {
        if (node.innerText && ['SCRIPT'].indexOf(node.nodeName) == -1) {
            if (node.children) {
                Array.prototype.forEach.call(node.children, function(node) { __search(node) })        
            }
            if (!catches.some(_node => node.contains(_node)) &&
                node.innerText.match(RegExp(name,'gi'))
            ) {
                catches.push(node)
            }
        }
        return catches
    }
	return __search(node)
}

/**
 * @name    replaceToLinkData: Apply popover in nodes returned from search
 *
 * @params  name: String
 *
 * @return  undefined
 * 
 */
var replaceToLinkData = (name) => {
  search(document.body, name).forEach(el => {
    el.innerHTML = el.innerHTML.replace(RegExp(name, 'gi'), `<a href="#">${name}</a>`)
  })
}

names.forEach(name => {
  replaceToLinkData(name)
})

var uniq = (acc, curr) => {
  var found = acc.find(val => val === curr);

  if (found) {
    return acc;
  }

  return acc.concat([curr]);
}

var scanBody = function() {
  var body = document.body.innerText;
  var names = body.match(rgNames) || [];
  var CNPJS = body.match(rgCNPJS) || [];

  return {
    names: names.reduce(uniq, []),
    CNPJS: CNPJS.reduce(uniq, [])
  };
}

var searchBrasilIo = (search) => {
  return new Promise(resolve => {
    if (!search) {
      resolve([]);
    }

    fetch(`https://brasil.io/api/dataset/eleicoes-brasil/candidatos/data?format=json&search=${search}`, {
      "headers": {
        "Content-Type": "application/json"
      },
      "body": null,
      "method": "GET",
    })
    .then(res => {
      if (res.status !== 200) {
        resolve("Request status: " + res.status + " - This doesn't look right...");
      }

      res.json().then(data => {
        data.search = search;

        resolve(data);
      }).catch(err => {
        console.log("ERR:: The fetch API request returned an error: " + err);
        resolve(err);
      });
    }).catch(err => {
      console.log("ERR:: The fetch API request returned an error: " + err);
      resolve(err);
    });
  })
}

window.addEventListener("load", () => {
  if (document.readyState === "complete") {
    var result = scanBody();

    if (result.names.length) {
      var promises = result.names.map(name => {
        return searchBrasilIo(name);
      });

      Promise.all(promises)
        .then(res => {
          // guarda os dados recebido da API
          dataBrasilIo = res
          .filter(data => data.results.length)
            .map(data => {
              return {name: data.search, results: data.results};
            });

          dataBrasilIo.forEach(data => {
            replaceToLinkData(data.name)
          });

        })
    }
  }
})

/**
 * 
 * Cosuming API Brasil.io
 * 
 */
var api = {
  baseURL: 'https://brasil.io/api/dataset',
  name: 'Jair Bolsonaro',
  pessoa: {},
  socio: {},
  eleicoes: [],
  filiacoes: [],
  gastosCota: [],
  gastos: [],

  async getAll() {
    let res = await fetch(`${this.baseURL}/documentos-brasil/documents/data?format=json&search=${this.name}`)
    let { results } = await res.json()
    
    this.pessoa = results[2] // get jair messias bolsonaro
    console.log(this.pessoa)

    res = await fetch(`${this.baseURL}/socios-brasil/socios/data?format=json&nome_socio=${this.pessoa.name}`)
    data = await res.json()

    this.socio = data.results[0]
    console.log(this.socio)

    res = await fetch(`${this.baseURL}/eleicoes-brasil/candidatos/data?format=json&cpf_candidato=${this.pessoa.document}`)
    data = await res.json()

    this.eleicoes = data.results
    console.log(...this.eleicoes)

    res = await fetch(`${this.baseURL}/eleicoes-brasil/filiados/data?format=json&nome_do_filiado=${this.pessoa.name}`)
    data = await res.json()

    this.filiacoes = data.results
    console.log(...this.filiacoes)

    res = await fetch(`${this.baseURL}/gastos-deputados/cota_parlamentar/data?format=json&txtcnpjcpf=${this.pessoa.document}`)
    data = await res.json()

    this.gastosCota = data.results
    console.log(...this.gastosCota)

    res = await fetch(`${this.baseURL}/gastos-diretos/gastos/data?format=json&codigo_favorecido=${this.pessoa.document}`)
    data = await res.json()

    this.gastos = data.results
    console.log(...this.gastos)
  }
}

// test
// api.getDocByName()