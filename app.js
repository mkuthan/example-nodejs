var express = require('express')
var path = require('path');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

var port = parseInt(process.argv[2]);

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', function(req, res){
    res.sendfile('index.html');
});


io.on('connection', function (socket) {
    socket.on('move', function (data) {
        socket.broadcast.emit('moving', data);
    });
});

http.listen(port, function(){
    console.log('Board started on: ' + port);
});