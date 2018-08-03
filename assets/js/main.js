document.addEventListener('DOMContentLoaded', function(){
  tippy(document.querySelector('#myElement'), {
    delay: 100,
    arrow: true,
    interactive: true,
    html: '#myTemplate'
    // trigger: 'click'
  });
});

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
 * 
 * Apply popover in nodes returned from search
 * 
 */
names.forEach(name => {
  search(document.body, name).forEach(el => {
    el.innerHTML = el.innerHTML.replace(RegExp(name,'gi'),`<a href="#">${name}</a>`)
  })
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