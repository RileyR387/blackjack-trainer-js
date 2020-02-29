
const config = require('config');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

console.log('Using configuration', config);

const port = config.get('app.port') || process.env.PORT || 3000;

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server, {path: config.app.prefix + '/io'});

app.set('view engine', 'ejs')

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const sess = config.session
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
sess.store = new FileStore({ ttl: config.session.store_ttl })
app.use( session(sess) )

require('./routes')(app, config);
require('./sockets')(io, config);

app.set('views', __dirname + '/views');

app.use(config.app.prefix, express.static(path.join(__dirname, '../client')))

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

