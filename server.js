const io = require('socket.io')(3000, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

let boardState = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.emit('load', boardState);

    socket.on('draw', (data) => {
        boardState.push(data);
        socket.broadcast.emit('draw', data);
    });

    socket.on('clear', () => {
        boardState = [];
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

console.log('Socket.IO server running on http://localhost:3000');