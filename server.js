

var outport= process.env.port || 1337;
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
var collections = ["users","apps","pages", "connected"];
var db = require('mongojs').connect(connectionString, collections);


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
	db.connected.remove();	
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

function findDatabyIP(address , callback){
	db.connected.find({IPaddress:address},function(err,urs){

		if (err || !urs){
			callback (err, null);
		}else{
			if (urs.length>0){
				console.log('user found: ' +urs._id);
				if (Date.now() -urs.lastLastLogin < 60,000 ){
					db.connected.update( {_id: (urs._id)}, { $set:{lastLastLogin: Date.now }}, function(err, urs){
						callback(null, {username : (urs.username), lastLastLogin: (Date.now()) , authorized :true, IPaddress : address, _id : (urs._id) } );
					}); 
					
				}else {
					
					db.connected.remove( {_id: (urs._id)},null, function(err, urs){
						callback(null, {username : 'not found', lastLastLogin: (Date.now()), authorized :true, IPaddress : address, _id : (urs._id) } ); 
					});
				}
			 }
			else {
				console.log('user not found');
				db.connected.save ({username : 'not found', lastLastLogin: (Date.now()) , authorized :true, IPaddress : address }, function(err,newUrs){
					console.log(newUrs);
				callback(null, {username : 'not found', lastLastLogin: (Date.now()) , authorized :true, IPaddress : address, _id : (newUrs._id)}); 
				});
			}
		}
	});
}

var users = {};
var userNumber = 1;
var parseCookie = require('cookie');

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    // findDatabyip is an async example function
    findDatabyIP(handshakeData.address.address, function (err, data) {
      if (err) return callback(err);

      if (data.authorized) {
        for(var prop in data) handshakeData[prop] = data[prop];
        callback(null, true);
      } else {
        callback(null, false);
      }
    }) 
  });
});
	
io.sockets.on('connection', function (socket) {	
	function databaseError(message){
		console.log(message);
		socket.emit('Database Error', {'error': message});
	}
	if ( socket.handshake.username=='not found'){
		var myNumber = userNumber++;
		socket.handshake.username = socket.handshake._id;
		db.connected.update({_id: (socket.handshake._id)}, {$set:{username:(socket.handshake.username), lastLastLogin: (Date.now())}},function(err,urs){  
		  if (err){
		  	databaseErrorMessage('User not saved');
		  }
		
		});
	}
	
	console.log ('Someone Connected');
	
	
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
					socket.handshake.loggedin= true;
					socket.emit('User Logged In', {});
				}else{
					databaseError(wrongUserName);
				}
					
			}	
		});
	});
		
socket.on ('Register User', function (data){
	db.users.find({username:data.user},function(err,urs){
		if (err || !urs){
			databaseError(databaseErrorMessage);	
		}else{
			if (urs.length>0){
				databaseError(userExistMessage);	
			}else{
				socket.handshake.loggedin= true;		
				db.users.save({username:data.user,password:data.pass},function(err,urs){
					socket.emit('User Logged In', {});
				});
			}
		}	
	});	
});
	
});


