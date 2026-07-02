const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    
    socket.on('join room', (data) => {
        // مغادرة الغرفة السابقة إن وجدت
        if(socket.currentRoom) {
            socket.leave(socket.currentRoom);
            io.to(socket.currentRoom).emit('chat message', {
                user: '🤖 النظام',
                text: `${socket.username} انتقل إلى غرفة أخرى`
            });
        }

        // تسجيل البيانات الجديدة في الجلسة
        socket.username = data.username;
        socket.role = data.role;
        socket.currentRoom = data.room;

        // الدخول للغرفة الجديدة
        socket.join(data.room);
        
        // إرسال الترحيب لأعضاء الغرفة الجديدة فقط
        io.to(data.room).emit('chat message', {
            user: '🤖 النظام',
            text: `${socket.username} (${socket.role}) انضم إلى غرفة ${data.room}`
        });
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', {
            user: socket.username,
            role: socket.role,
            text: data.text
        });
    });

    socket.on('disconnect', () => {
        if(socket.username && socket.currentRoom) {
            io.to(socket.currentRoom).emit('chat message', {
                user: '🤖 النظام',
                text: `${socket.username} غادر الدردشة`
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat running on http://localhost:${PORT}`);
});
