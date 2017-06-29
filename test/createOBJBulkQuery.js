
let a = { id_sistema: '7',
  nomeperfilacesso: 'felipe 1629',
  functionalities: [ '1', '4', '12' ] }

//let values = []
let lastIDCreated = 50
let b = a.functionalities.map(function(e){
  let item = []
  new Array().push.call(item,lastIDCreated, parseInt(e))
  return item
})
console.log(b);
