
module.exports = function (app, config ) {
  this.stash = {
    app_name: config.app.name,
    page_title: config.app.name
  }

  this.Index = function( req, res ){
    res.render('game');
  }

  if( config.app.prefix != ''){
    app.get('/', function( req, res ){
      if( config.app.prefix){
        res.redirect(config.app.prefix + '/');
      } else {
        return this.Index( req, res );
      }
    });
  }
  app.get(config.app.prefix + '/', function( req, res ){
    return this.Index( req, res );
  });

}

