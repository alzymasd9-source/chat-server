const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تحديد المجلد المسؤول عن ملفات الواجهة (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// إدارة اتصالات المستخدمين
io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل بالشات');

    // استقبال الاسم المستعار وتخزينه في جلسة السوكت
    socket.on('join', (username) => {
        socket.username = username || 'مستخدم مجهول';
        // إشعار الجميع بدخول مستخدم جديد
        io.emit('chat message', {
            user: '🤖 النظام',
            text: `${socket.username} انضم إلى الدردشة`
        });
    });

    // استقبال الرسائل وإعادة بثها لجميع المتواجدين
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            user: socket.username,
            text: msg
        });
    });

    // عند مغادرة المستخدم
    socket.on('disconnect', () => {
        if(socket.username) {
            io.emit('chat message', {
                user: '🤖 النظام',
                text: `${socket.username} غادر الدردشة`
            });
        }
    });
});

// تشغيل السيرفر على البورت المحلي أو بورت الاستضافة
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل بنجاح على الرابط: http://localhost:${PORT}`);
});
