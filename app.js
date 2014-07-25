var express = require('express')
var path = require('path');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', function(req, res){
    res.sendfile('index.html');
});


io.on('connection', function (socket) {
    socket.on('move', function (data) {
        socket.broadcast.emit('moving', data);
    });
});

http.listen(8080, function(){
    console.log('Board started');
});