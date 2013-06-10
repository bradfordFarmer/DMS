var io;
var db;
//error messages
var databaseErrorMessage= 'Database error';
var appAlreadyExistsMessage='Application Name already taken'; 
var wrongUserName ='Wrong userName or password';	
var userExistMessage ='user already exists';


function setupSocket(myDB, myIO, sessionStore){
	db=myDB;
	io=myIO;
	var parseCookie = require('cookie');
	 
	io.set('authorization', function (data, accept) {
		
		if (data.headers.cookie) {
			data.cookie = parseCookie.parse(data.headers.cookie);
			data.sessionID = data.cookie['express.sid'];
			// save the session store to the data object 
			// (as required by the Session constructor)
			data.sessionStore = sessionStore;
			sessionStore.get(data.sessionID, function (err, session) {
				console.log (data);
				if (err || !session) {
					accept('Error', false);
				} else {
					// create a session object, passing data as request and our
					// just acquired session data
					data.session = new Session(data, session);
					accept(null, true);
				}
			});
		} else {
		   return accept('No cookie transmitted.', false);
		}
	});

	io.sockets.on('connection', function (socket) {
		 console.log('A socket with sessionID ' + socket.handshake.sessionID 
        + ' connected!');
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
}

exports.setupSocket= setupSocket;