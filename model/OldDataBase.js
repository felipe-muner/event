const conn = require(process.env.PWD + '/conn');

function OldDataBase(){
  this.findBudgetUser = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT
                  'orcamento.setor,
                  'orcamento.grupo,
                  'orcamento.conta,
                  'orcamento.saldo
                'FROM
                  'orcamento,
                  'tblusers
                'Inner Join user_view_budget ON tblusers.ID_USER = user_view_budget.id_user AND user_view_budget.id_budget = orcamento.id_orca', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allDepartament = result
          next()
        }
      });
    });
  }
}

module.exports = new OldDataBase()
