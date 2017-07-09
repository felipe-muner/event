var privateVariable = true;

//Public
module.exports = Muner;
  function Muner(n) {
      this.name = n;
  }

Muner.prototype.foobar = function(){
  console.log('funcionou')
}
