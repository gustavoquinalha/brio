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

names.forEach(name => {
  search(document.body, name).forEach(el => {
    el.innerHTML = el.innerHTML.replace(RegExp(name,'gi'),`<a href="#">${name}</a>`)
  })
})