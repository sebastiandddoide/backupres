var express = require('express');
var app = express();
var nconf = require('nconf');
var bodyParser = require('body-parser');
var mysql = require("mysql");
var auth = require('http-auth');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
nconf.use('file', { file: 'config.json' });
nconf.load();

var mysqlConf = {
		host: nconf.get('database:host'),
		user: nconf.get('database:user'),
		password: nconf.get('database:password'),
		database: nconf.get('database:databasename')
};

// Authentication module. 
var basic = auth.basic({
		realm: "Simon Area."
	}, function (username, password, callback) { 
	    // Custom authentication 
	    // Use callback(error) if you want to throw async error. 
		callback(username === nconf.get('auth:user') && password === nconf.get('auth:password'));
	}
);
app.use(auth.connect(basic));

app.get(nconf.get('http:serviceUri'),function (req,res){
	var connection = mysql.createConnection(mysqlConf);
	connection.connect();
	var query = "SELECT * FROM ??";
    var table = ["backups"];
    query = mysql.format(query,table);
    connection.query(query,function(err,rows){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query", "ErrorContent" : err});
        } else {
            res.json({"Error" : false, "Message" : "Success", "Backups" : rows});
        }
    });
	connection.end();
});

app.put(nconf.get('http:serviceUri'),function (req,res){
	var connection = mysql.createConnection(mysqlConf);
	connection.connect();
	//console.log(req.body);
	var lastId;
	var backup = { exito: req.body.Informacion.InfoEjecucion.EjecucionFinalizada, configuracion: JSON.stringify(req.body.Informacion), mensajes: req.body.Informacion.InfoEjecucion.Mensaje};
		connection.query('INSERT INTO backups SET ?', backup, function(err,res){
		if(err) throw err;
		console.log('Last insert ID:', res.insertId);
		lastId = res.insertId;
		});
	connection.end();
	res.json(lastId);
});

app.post(nconf.get('http:serviceUri'),function (req,res){
	console.log(req.body);
	res.json(req.body);
});

var port = nconf.get('http:port');
app.listen(port);
console.log("Server on " + port);