const moment = require('moment')

function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout:'layout',
    helpers: {
      section: function(name, options){
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
      dizNome: function() {
        return moment().format('YYYY-MM-DD hh:mm:ss:SSS')
      },
      inc: function(value) {
        console.log(typeof value);
        return value + 1
      },
      convBoolToHuman: function(value) {
        console.log(value);
        return (parseInt(value) === 1) ? 'Sim/Yes' : 'Nāo/No'
      }

    }
  });
}

module.exports = hbsHelpers;
