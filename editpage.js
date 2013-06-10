var db;


function setApp(idb){
	db=idb;
}

function respond(req,res){
	console.log(req.params.id);
	req.session.pagename=req.params.id;
		
	db.pages.find({pagename:req.session.pagename},function(err,urs){
	
		if (err || !urs){
			res.end("Database Error!");		
		}else{
			if (urs.length>0){
				req.session.pagename=urs[0].pagename;
				res.render('editpage.jade',{session:req.session});		
			}else{
				res.end("Wrong username or password!"+(req.params.id));
			}
				
		}	
	}
	
	); 
	
	
}

exports.respond=respond;
exports.setApp=setApp;