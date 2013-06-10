var db;


function setApp(idb){
	db=idb;
}

function respond(req,res){
	
	res.render('apps.jade',{session:req.session});	
}


function respondGetAppsDo(req,res){
	db.apps.find({},function(err,apps){
		if (err || !apps){
			res.end("Database Error!");		
		}else{
			console.log((apps));
			res.end(""+JSON.stringify(apps));
				
		}	
	}

	); 

}


function respondAddAppDo(req,res){
		db.apps.find({appname:req.body.appname},function(err,apps){
		if (err || !apps){
			res.end("Database Error!");		
		}else{
			if (apps.length>0){
				res.end("User already exists!");	
			}else{
				db.apps.save({appname:(req.body.appname)},function(err,urs){ res.end("Added New App");});
			}
		}	
	}
	); 
}



exports.respond=respond;
exports.respondGetAppsDo=respondGetAppsDo;
exports.respondAddAppDo=respondAddAppDo;
exports.setApp=setApp;