# brio
> Brasil.io extension https://brasil.io/home

//pegar texto da pagina:
$x('//*[not(name() = "script" or name() = "style")]/text()').map(function (obj) {return obj.textContent.trim();}).join(' ');
