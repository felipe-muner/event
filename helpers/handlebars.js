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
      }
    }
  });
}

module.exports = hbsHelpers;
