const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// مصفوفة مؤقتة لحفظ الحسابات المسجلة أثناء تشغيل السيرفر
const registeredUsers = [];

io.on('connection', (socket) => {
    
    // 1. معالجة عملية التسجيل الجديدة
    socket.on('register user', (data) => {
        // التحقق من عدم تكرار الاسم
        const exists = registeredUsers.some(u => u.username === data.username);
        if (exists) {
            socket.emit('register response', { success: false, msg: 'هذا الاسم مسجل مسبقاً!' });
        } else {
            registeredUsers.push(data);
            socket.emit('register response', { success: true, msg: 'تم إنشاء الحساب بنجاح!' });
        }
    });

    // 2. معالجة تسجيل دخول الأعضاء
    socket.on('member login', (data) => {
        const user = registeredUsers.find(u => u.username === data.username && u.password === data.password);
        if (user) {
            socket.emit('login response', { success: true, user: user });
        } else {
            socket.emit('login response', { success: false, msg: 'اسم المستخدم أو كلمة المرور غير صحيحة!' });
        }
    });

    // 3. معالجة دخول الغرفة (للزوار والأعضاء)
    socket.on('join room', (data) => {
        socket.join(data.room);
        socket.username = data.name;
        socket.gender = data.gender || 'other';
        socket.role = data.role || 'user';

        // إرسال رسالة ترحيبية للغرفة بالاسم الجديد
        io.to(data.room).emit('chat message', { 
            isSystem: true, 
            text: `📢 ${data.name} انضم للغرفة هلا وسهلا` 
        });
    });

    // 4. استقبال وتوزيع الرسائل داخل الغرف
    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', data);
    });

    socket.on('disconnect', () => {
        // يمكن إضافة نظام مغادرة هنا لاحقاً
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Chat server running perfectly on port ${PORT}`);
});
