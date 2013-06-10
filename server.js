

var outport= process.env.PORT || 1337;
var express = require('express');
var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI ||  "localhost:27017";
var login=require('./login'),
	apps=require('./apps'),
	socketIO=require('./socket');
	http=require('http'),
	singleapp=require('./singleapp'),
	editpage=require('./editpage'),
	MemoryStore = express.session.MemoryStore,
	sessionStore = new MemoryStore();
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server);


app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
	  store: sessionStore,
	  secret:'supadupadudu',
	  key: 'express.sid'}));
});

app.set('view engine', 'jade');
app.use("/publicweb", express.static(__dirname + '/publicweb'));
var collections = ["users","apps","pages"];
var db = require('mongojs').connect(connectionString);


login.setApp(db);
apps.setApp(db);
socketIO.setupSocket(db,io,sessionStore);
singleapp.setApp(db);
editpage.setApp(db);


//login and register
app.get('/', login.respondLogin);
app.get('/login', login.respondLogin);
app.post('/logindo', login.respondLoginDo);
app.post('/registerdo', login.respondRegisterDo);
app.get('/apps', apps.respond);
app.post('/getappsdo', apps.respondGetAppsDo);
app.post('/addappdo', apps.respondAddAppDo);
app.get('/app/:id', singleapp.respond);
app.post('/getpagesdo', singleapp.respondGetPagesDo);
app.post('/addpagedo', singleapp.respondAddPageDo);
app.get('/editpage/:id', editpage.respond);
app.get('/clear', function(){
	db.apps.remove();	
	db.pages.remove();	
});



console.log("Up and running on port :"+outport);
server.listen(outport);

exports.db=db;




/*
login/register

LOGIN / REGISTER / ROLES
APPS - LIST / ADD APPS
APP - EDIT / DELETE APP
CHAPTERS ADD / EDIT / DELETE
PAGES - LIST / ADD PAGES
PAGE - EDIT / DELETE / PARTENT-TO-CHAPTER 
ASSET CATEGORIES ADD / EDIT / DELETE 
ASSET - EDIT / DELETE / PARENT-TO-ASSET CATEGORY
*/