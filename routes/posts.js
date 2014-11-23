var events = require('events');

exports.list = function(req, res){
	var model = req.app.db.model.Post;
	
  	model
  		.find({})
  		.exec(function(err, posts) {
		  	res.send({
		  		posts: posts
		  	});
		  	res.end();
  		});
};

exports.create = function(req, res){
	var workflow = new events.EventEmitter();
	var model = req.app.db.model.Post;
	var title = req.query.title;
	var content = req.query.content;

	workflow.outcome = {
		success: false,
		errfor: {}
	};
	
	workflow.on('validation', function() {
		subject = req.body.subject;
		content = req.body.content;	

		if (subject.length === 0) 
			workflow.outcome.errfor.subject = '這是必填欄位';

		if (content.length === 0) 
			workflow.outcome.errfor.content = '這是必填欄位';

		if (Object.keys(workflow.outcome.errfor).length !== 0)
			return workflow.emit('response');

		workflow.emit('savePost');
	});

	workflow.on('savePost', function() {
		var post = new model({
			title: title,
			content: content
		});
		post.save();

		workflow.emit('response');
	});

	workflow.on('response', function() {
	});
};