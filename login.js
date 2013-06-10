var db;


function setApp(idb){
	db=idb;
}

function respondLogin(req,res){
	
	res.render('login.jade',{});	
}

function respondLoginDo(req,res){
	db.users.find({username:req.body.user,password:req.body.pass},function(err,urs){
		if (err || !urs){
			res.end("Database Error!");		
		}else{
			if (urs.length>0){
				req.session.authed=true;
				req.session.username=urs[0].username;
				res.end("go");	
			}else{
				res.end("Wrong username or password!");
			}
				
		}	
	}
	
	); 

}


function respondRegisterDo(req,res){
	db.users.find({username:req.body.user},function(err,urs){
		if (err || !urs){
			res.end("Database Error!");		
		}else{
			if (urs.length>0){
				res.end("User already exists!");	
			}else{
				req.session.authed=true;
				req.session.username=req.body.user;				
				db.users.save({username:req.body.user,password:req.body.pass},function(err,urs){ res.end("go");});
			}
				
		}	
	}
	); 

}


exports.respondLogin=respondLogin;
exports.respondLoginDo=respondLoginDo;
exports.respondRegisterDo=respondRegisterDo;
exports.setApp=setApp;