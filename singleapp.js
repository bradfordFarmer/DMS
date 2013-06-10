var db;


function setApp(idb){
	db=idb;
}

function respond(req,res){
	console.log(req.params.id);
	req.session.appname=escape(req.params.id);
		
	db.apps.find({appname:req.session.appname},function(err,urs){
	
		if (err || !urs){
			res.end("Database Error!");		
		}else{
			if (urs.length>0){
				req.session.appname=urs[0].appname;
				req.session.appid=urs[0]._id;
				res.render('app.jade',{session:req.session});		
			}else{
				res.end("Wrong username or password!"+escape(req.params.id));
			}
				
		}	
	}
	
	); 
	
	
}


function respondGetPagesDo(req,res){
	console.log("GETTING PAGES FOR "+req.session.appid);
	db.pages.find({appid:req.session.appid},function(err,urs){
		if (err || !urs){
			res.end("Database Error!");		
		}else{
			for (var i in urs){
				console.log(">>"+urs[i].appid+" "+urs[i].pagename);	
			}
			res.end(""+JSON.stringify(urs));		
		}	
	}
	); 
	
	
}

function respondAddPageDo(req,res){
	console.log("add page do"+req.body.pagename+" "+req.session.appid);
	db.pages.find({pagename:req.body.pagename,appid:req.session.appid},function(err,uss){
		if (err || !uss){
			
		}else{
			if (uss.length==0){
				db.pages.save({pagename:(req.body.pagename),appid:req.session.appid,content:"Stuff"},function(err,urs){ res.end(""+{status:"ok"});});
			}else{
				res.end(""+{status:"ok"});	
			}
		}
	});

}

function respondUpdatePageDo(req,res){
	console.log("add page do"+req.body.pagename+" "+req.session.appid);
	db.pages.find({pagename:req.body.pagename,appid:req.session.appid},function(err,uss){
		if (err || !uss){
			
		}else{
			if (uss.length==0){
				db.pages.update({pagename:(req.body.pagename),appid:req.session.appid,content:"Puff"},function(err,urs){ res.end(""+{status:"ok"});});
			}else{
				res.end(""+{status:"ok"});	
			}
		}
	});

}

exports.respondUpdatePageDo=respondUpdatePageDo;
exports.respondAddPageDo=respondAddPageDo;
exports.respondGetPagesDo=respondGetPagesDo;
exports.respond=respond;
exports.setApp=setApp;