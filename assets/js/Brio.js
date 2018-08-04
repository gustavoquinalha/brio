class Brio {
  constructor() {
    try {
      this.regexName = /([A-Z]+\w{3,12})+?(\s[A-Z]\w{3,12})?(\s[A-Z]\w{3,12})?(\s[A-Z]\w{3,12})/g
      this.regexDoc = /(\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2})/g
      
      this.whiteList = [
        'Jair Messias Bolsonaro'
      ]

      this.body = document.body.innerText
      if (!this.body) {
        throw('document.body.innerText is invalid')
      }

      const popover = `
        <div class="popover-profile" id="myTemplate">
          <div class="popover-head container">
            <div class="popover-img">
              <img src="https://www.tribunapr.com.br/wp-content/uploads/sites/1/2016/11/bolsonaro-825x665.jpg" class="img-profile" alt="">
            </div>
            <div class="popover-name container column">
              <strong>Jair Messias Bolsonaro</strong>
              <small>***17828***</small>
              <ul class="list-none">
                <li>21/03/1955 (63 anos), Campinas, SP</li>
                <li>Deputado federal</li>
              </ul>
            </div>
          </div>
          <div class="popover-content">
            <ul class="list-none margin-bottom-10">
              <li class="list-title">Candidaturas</li>
              <li><small><strong>2014</strong> - RJ/RIO DE JANEIRO - 1 - DEPUTADO FEDERAL - PP</small> </li>
              <li><small><strong>2014</strong> - RJ/RIO DE JANEIRO - 1 - DEPUTADO FEDERAL - PP</small> </li>
              <li><small><strong>2014</strong> - RJ/RIO DE JANEIRO - 1 - DEPUTADO FEDERAL - PP</small> </li>
              <li><small><strong>2014</strong> - RJ/RIO DE JANEIRO - 1 - DEPUTADO FEDERAL - PP</small> </li>
            </ul>
            <ul class="list-none">
              <li class="list-title">Sociedades</li>
              <li> <small><strong>27516314000106</strong> - BOLSONARO DIGITAL LTDA - ME - Pessoa Física - Sócio</small></li>
            </ul>
          </div>
          <div class="popover-bottom">
            <div class="popover-options">
              <span class="list-title">Partidos filiados</span>
              <ul class="list-none container wrap">
                <li class="label">PSL</li>
                <li class="label">DEM</li>
                <li class="label">PP</li>
                <li class="label">PTB</li>
                <li class="label">PSC</li>
              </ul>
              <button type="button" name="button" class="btn btn-info">+ info</button>
            </div>
          </div>
        </div>
      `

      document.body.insertAdjacentHTML('beforeend', popover)
    } catch (error) {
      this.error = error
      console.error(error)
    }
  }

/**
   * @name start inicia o programa
   */
  start() {
    if (this.error) return this.error
    
    var payload = this.scan()

    payload.names.forEach(name => {
      this.fetchByName(name).then(data => {
        data.forEach(item => {
          this.search(document.body, item.person.name).forEach(catchy => {
            catchy.node.innerHTML = catchy.node.innerHTML.replace(RegExp(catchy.matches, 'gi'), `<a href="#">${catchy.matches}</a>`)
            tippy(catchy.node, {
              delay: 100,
              arrow: true,
              interactive: true,
              html: '#myTemplate'
              // trigger: 'click'
            });
          })
        })
      })
    })
  }

  /**
   * 
   * @name scan analisa a pagina
   * @return {Object} retorna objeto com nomes, documentos e etc
   *  
   */
  scan() {
    var names = this.body.match(this.regexName) || [];

    /**
     * 
     * Limpa nomes repetidos
     * 
     * Verifica o nome na whitelist
     * e retorna o valor da white list
     * 
     * limpa e remove itens repetidos
     * 
     */
    names = names.reduce(this.uniq, [])
    names = names.map(name => {
      return this.whiteList.find(_name => {
        return _name.match(RegExp(name.split(' ').join('|'), 'gi'))
      })
    })
    names = names.filter(name => name).reduce(this.uniq, [])

    return {
      names: names
    };
  }

  /**
   * 
   * @param {any} acc
   * @param {any} curr
   * 
   */
  uniq(acc, curr) {
    var found = acc.find(val => val === curr);
  
    if (found) {
      return acc;
    }
  
    return acc.concat([curr]);
  }

  /**
   * 
   * @name fetchByName consulta datasets do brasil.io
   * @param {String} name 
   * @return {Array} dados coletados do brasil.io
   * 
   */
  async fetchByName(name) {
    let response = await fetch(this.parseURL('documentos-brasil/documents', `search=${name}`))
    const data = await response.json()
    const persons = data.results.filter(item => item.document_type === 'CPF')
    
    const promises = persons.map(async person => {
      return this.getAllSync(person)
    })

    return Promise.all(promises)
  }

  /**
   * 
   * @name getAllSync busca os dados complementares nos datasets da brasil.io
   * @param {Object} person objecto com dados da pessoa
   * @return {Object} dados coletados dos datasets da brasil.io
   * 
   */
  async getAllSync(person) {
    let res = await fetch(this.parseURL('socios-brasil/socios', `nome_socio=${person.name}`))
    let data = await res.json()
    
    const socio = data.results // [0] atempt to this

    res = await fetch(this.parseURL('eleicoes-brasil/candidatos', `cpf_candidato=${person.document}`))
    data = await res.json()
    const eleicoes = data.results

    res = await fetch(this.parseURL('eleicoes-brasil/filiados', `nome_do_filiado=${person.name}`))
    data = await res.json()
    const filiacoes = data.results

    res = await fetch(this.parseURL('gastos-deputados/cota_parlamentar', `txtcnpjcpf=${person.document}`))
    data = await res.json()
    const gastosCota = data.results

    res = await fetch(this.parseURL('gastos-diretos/gastos', `codigo_favorecido=${person.document}`))
    data = await res.json()
    const gastos = data.results

    return {
      person,
      socio,
      eleicoes,
      filiacoes,
      gastosCota,
      gastos
    }
  }

  /**
   * @name search busca nome nos nos
   * @param {HTMLNodeElement} node 
   * @param {String} name 
   * @return {Array:Object:[HTMLNodeElement,Array]}
   */
  search(node, name) {
    if (!node || !name ) return false;

    var catches = [];
    var __search = function(node) {
      if (node.innerText && ['SCRIPT'].indexOf(node.nodeName) == -1) {
        if (node.children) {
          Array.prototype.forEach.call(node.children, function(node) { __search(node) })        
        }
        var matches = node.innerText.match(RegExp(name.split(' ').join('|'), 'gi'))
        if (!catches.some(catchy => node.contains(catchy.node)) && matches) {
          catches.push({
            node,
            matches: [...new Set(matches.map(item => item))].join(' ')
          })
        }
      }
      return catches
    }
    return __search(node)
  }

  /**
   * @name parseURL monta a url para consulta dos datasets da brasil.io
   * @param {String} dataset 
   * @param {String} query 
   * @return {String} url da api do dataset da brasil.io
   */
  parseURL(dataset, query) {
    return `https://brasil.io/api/dataset/${dataset}/data?format=json&${query}`
  }
}