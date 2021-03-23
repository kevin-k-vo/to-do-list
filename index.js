const express = require('express');
const app = express();
const port = 3000;

const handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data/todo.db', function(err){
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to todo.db')
})

app.get ('/', function(req, res){
	
	if (req.query.get == "table") {
		let sql = 'SELECT * FROM todo';
		
		db.all(sql, [], function(err, rows){
			if (err) {
				return console.error(err.message);
			}
			res.send(rows);
		});
	}

	else {
		res.render('home');
	}
});


app.post ('/', function(req, res) {
	if (req.body.action == "insert") {
		sql_q = "INSERT INTO todo (task, due, done) VALUES ('New Task', '00-00-0000', '0')";
		
		db.run(sql_q, [], function(err){
			if (err) {
				return console.error(err.message);
			}
			console.log("Inserted New Task");
			res.render('home');
		});
	}
	
	else if (req.body.action == "delete") {
		sql_q = "DELETE FROM todo WHERE id = ?";
		
		db.run(sql_q, req.body.id, function(err){
			if (err) {
				return console.error(err.message);
			}
			console.log("Delete " + req.body.id);
			res.render('home');
		});
	}
	
	else if (req.body.action == "updatedone") {
		sql_q = "UPDATE todo SET done = ?, edited = ? WHERE id = ?";
		
		db.run(sql_q, [req.body.mark, req.body.edited, req.body.id], function(err){
			if (err) {
				return console.error(err.message);
			}
			console.log("Updated done status of " + req.body.id);
			res.render('home');
		});
	}
	
	else if (req.body.action == "updatetask") {
		sql_q = "UPDATE todo SET task = ?, edited = ? WHERE id = ?";
		
		db.run(sql_q, [req.body.task, req.body.edited, req.body.id], function(err){
			if (err) {
				return console.error(err.message);
			}
			console.log("Updated task " + req.body.id);
			res.render('home');
		});
	}
});


app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(port, function(){
  console.log(`Express started on http://localhost:${port}; press Ctrl-C to terminate.`);
});