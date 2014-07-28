$(function () {

    // This demo depends on the canvas element
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }

    var doc = $(document),
        canvas = $('#paper'),
        ctx = canvas[0].getContext('2d'),
        instructions = $('#instructions');

    var clientId = generateClientId();
    var clientColour = generateClientColour();

    var drawing = false;

    var clients = {};
    var cursors = {};

    var socket = io.connect();
    socket.on('moving', function (data) {

        if (!(data.id in clients)) {
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }

        cursors[data.id].css({
            'left': data.x,
            'top': data.y
        });

        if (data.drawing && clients[data.id]) {
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, clients[data.id].colour);
        }

        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });

    var prev = {};

    canvas.on('mousedown', function (e) {
        e.preventDefault();
        onDrawBegin(e.pageX, e.pageY);
    });

    canvas.on('touchstart', function (e) {
        e.preventDefault();
        var pos = getTouchPosition(canvas, e);
        onDrawBegin(pos.x, pos.y);
    });

    doc.bind('mouseup mouseleave touchend', function () {
        onDrawEnd()
    });

    var lastEmit = $.now();

    doc.on('mousemove', function (e) {
        onMove(e.pageX, e.pageY);
    });

    doc.on('touchmove', function (e) {
        var pos = getTouchPosition(canvas, e);
        onMove(pos.x, pos.y);
    });

    setInterval(function () {
        for (var id in clients) {
            if ($.now() - clients[id].updated > 10000) {
                cursors[id].remove();
                delete clients[id];
                delete cursors[id];
            }
        }

    }, 10000);

    function onDrawBegin(x, y) {
        drawing = true;

        prev.x = x;
        prev.y = y;
    }

    function onDrawEnd() {
        drawing = false;
    }

    function onMove(x, y) {
        if ($.now() - lastEmit > 30) {
            socket.emit('move', {
                'x': x,
                'y': y,
                'drawing': drawing,
                'id': clientId,
                'colour': clientColour
            });
            lastEmit = $.now();
        }

        if (drawing) {
            drawLine(prev.x, prev.y, x, y, clientColour);
            prev.x = x;
            prev.y = y;
        }
    }

    function generateClientId() {
        return Math.round($.now() * Math.random())
    }

    function generateClientColour() {
        var colours = ['red', 'green', 'blue', 'yellow', 'magenta', 'indigo', 'gray', 'brown'];
        return clientColour = colours[Math.floor(Math.random() * colours.length)];
    }

    function drawLine(x1, y1, x2, y2, color) {
        instructions.fadeOut();

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function getTouchPosition(canvas, e) {
        var rect = canvas.offset();
        return {
            x: e.originalEvent.touches[0].pageX - rect.left,
            y: e.originalEvent.touches[0].pageY - rect.top
        };
    }

});