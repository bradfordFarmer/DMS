var io;
var db;
//error messages
var databaseErrorMessage= 'Database error';
var appAlreadyExistsMessage='Application Name already taken'; 
	
	
function setupSocket(myDB, myIO){
	db=myDB;
	io=myIO;
	io.sockets.on('connection', function (socket) {
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
	});
}

exports.setupSocket= setupSocket;