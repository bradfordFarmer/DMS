

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
	  secret:'supadupadudu',
	  key: 'express.sid'}));
});

app.set('view engine', 'jade');
app.use("/publicweb", express.static(__dirname + '/publicweb'));
var collections = ["users","apps","pages"];
var db = require('mongojs').connect(connectionString);


login.setApp(db);
apps.setApp(db);

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

// socket io stuff here


var parseCookie = require('cookie');
 
io.set('authorization', function (data, accept) {
	if (data.headers.cookie) {
		data.cookie = parseCookie.parse(data.headers.cookie);
		data.sessionID = data.cookie['express.sid'];
		// save the session store to the data object 
		// (as required by the Session constructor)
		sessionStore.get(data.sessionID, function (err, session) {
			console.log (data);
			if (err || !session) {
				accept('Error', false);
			} else {
				// create a session object, passing data as request and our
				// just acquired session data
				 data.session = session;
			return accept(null, true);
			}
		});
	} else {
	   return accept('No cookie transmitted.', false);
	}
}).sockets.on('connection', function (socket) {
	var hs = socket.handshake;
	  var intervalID = setInterval(function () {
		// reload the session (just in case something changed,
		// we don't want to override anything, but the age)
		// reloading will also ensure we keep an up2date copy
		// of the session with our connection.
		hs.session.reload( function () { 
			// "touch" it (resetting maxAge and lastAccess)
			// and save it back again.
			hs.session.touch().save();
		});
	}, 60 * 1000);
		
	
	console.log ('Someone Connected');
	
	function databaseError(message){
		socket.emit('Database Error', {'error': message});
	}
	
	socket.on('Get all apps', function (data) {
		db.apps.find({},function(err,apps){
			if (err || !apps){
				databaseError(databaseErrorMessage);	
			}else{
				console.log((apps));
				socket.emit('List of Apps', JSON.stringify(apps));		
			}	
		});
	});

	socket.on('Add New Application', function (data){	
		console.log (data);
		db.apps.find({appname:data.appname},function(err,apps){
			if (err || !apps){
				databaseError(databaseErrorMessage);	
			}else{
				if (apps.length>0){
					databaseError(appAlreadyExistsMessage);		
				}else{
					db.apps.save({appname:(data.appname)},function(err,urs){ 
						socket.emit('New Application Added', ': '+ data.appname+' was added');
					});
				}		
			}	
		}); 
	});
	
	socket.on('Login User', function(data){
		db.users.find({username:data.user,password:data.pass},function(err,urs){
			if (err || !urs){
				databaseError(databaseErrorMessage);	
			}else{
				if (urs.length>0){
					hs.session.authed=true;
					hs.session.username=urs[0].username;
					socket.emit('User Logged In', {});
				}else{
					databaseError(wrongUserName);
				}
					
			}	
		});
	});
		
socket.on ('Register User', function (data){
	db.users.find({username:req.body.user},function(err,urs){
		if (err || !urs){
			databaseError(databaseErrorMessage);	
		}else{
			if (urs.length>0){
				databaseError(userExistMessage);	
			}else{
				hs.session.authed=true;
				hs.session.username=req.body.user;				
				db.users.save({username:req.body.user,password:req.body.pass},function(err,urs){
					socket.emit('User Logged In', {});
				});
			}
		}	
	});	
});
	
});