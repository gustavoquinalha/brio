# brio

//pegar texto da pagina:
$x('//*[not(name() = "script" or name() = "style")]/text()').map(function (obj) {return obj.textContent.trim();}).join(' ');
