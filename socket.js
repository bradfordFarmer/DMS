var io;
var db;
//error messages
var databaseErrorMessage= 'Database error';
var appAlreadyExistsMessage='Application Name already taken'; 
var wrongUserName ='Wrong userName or password';	
var userExistMessage ='user already exists';


function setupSocket(myDB, myIO){
	db=myDB;
	io=myIO;
	 

}

exports.setupSocket= setupSocket;