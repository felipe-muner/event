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
      json: function(obj) {
        return JSON.stringify(obj)
      },
      inc: function(value) {
        return value + 1
      },
      setSelected: function(value, unitList) {
        return (value === unitList) ? 'selected' : ''
      },
      convBoolToHuman: function(value) {
        //console.log('convBoolToHuman' + value);
        return (parseInt(value) === 1) ? 'Sim/Yes' : 'Nāo/No'
      }
    }
  });
}

module.exports = hbsHelpers;
