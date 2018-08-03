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

var names = [
  'Jair Bolsonaro',
  'Ciro Gomes',
  'Dilma Rouseff',
  'Lula',
  'Luis Inácio Lula da Silva',
  'Aécio Neves',
  'Mariana Davilla',
  'Marina da Silva',

  // custons

  'Marco Antonio',
  'Bolsonaro',
  'Itamaraty'
]

var dataBrasilIo = [];

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

var replaceToLinkData = (name) => {
  search(document.body, name).forEach(el => {
    el.innerHTML = el.innerHTML.replace(RegExp(name, 'gi'), `<a href="#">${name}</a>`)
  })
}

// names.forEach(name => {
//   replaceToLinkData(name)
// })

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