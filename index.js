"use strict";

const http = require('http');
const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const ExpressSession = require('express-session');

const socketIO = require('socket.io');
const socketIOExpressSession = require('socket.io-express-session');

const logger = require('./utils/logger.js')();
const routes = require('./routes/index.js');
const events = require('./events/index.js');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', routes);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views/'));

let session  = ExpressSession({
	secret: "RpkPostScrabble",
    resave: true,
    saveUninitialized: true
});
app.use(session);
app.session = session;

let port = config.port || 3000;
let server = http.createServer(app);

server.listen(port);
server.on('listening', onListening);
server.on('error', onError);

let io = socketIO(server);
io.use(socketIOExpressSession(app.session));
events(io);


function onListening(){
	logger.debug("Listening : " + JSON.stringify(server.address()));
}

function onError(err){
	logger.error(JSON.stringify(err));
}
