// Dependencies
var express = require('express')
  , http = require('http')
  , path = require('path')
 , bodyParser = require('body-parser');
var cors = require('cors')

// App settings
var app = express();
app.use(bodyParser.json());
app.use(cors());
app.set('port', process.env.PORT || 3000);

// Memory
var objects = [];
var object_id = 0;

// REST interface
app.get('/objects', function(req, res){
    console.log('Return all objects');
    res.json(objects);
});

app.put('/objects', function(req, res) {
    console.log('Add object');
    objects[object_id] = {object_id: object_id, geoJSON: req.body.geoJSON};
    object_id++;
    res.status(201).end();
});

app.post('/objects/:object_id', function(req, res) {
    console.log('Update object');
    objects[req.params.object_id].geoJSON = req.body.geoJSON;
    res.status(200).end();
});

app.delete('/objects/:object_id', function(req, res) {
    console.log('Delete object');
    delete objects[req.params.object_id];
    res.status(200).end();
});

// Create server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});