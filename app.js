const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join room', (data) => {
        socket.join(data.room);
        io.to(data.room).emit('chat message', { isSystem: true, text: `📢 [ ${data.name} ] انضم للغرفة` });
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
