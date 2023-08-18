const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const app = express()
const server = http.createServer(app)
const path = require('path')

const io = socketIO(server)
const port = 3000

const usernames = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public')
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

// function updateUsernames() {
//     io.sockets.emit('usernames', usernames);
// }


io.on('connection', (socket) => {

    // 使用者進入聊天室
    socket.on('new user', (data) => {
        const username = data.trim()
        // 
        if (usernames.includes(username)) {
            socket.emit('username taken')
            socket.emit('force logout')
            return
        }
        console.log(`socket ${socket.id} connected`)
        io.sockets.emit('chat', 'SERVER', data + ' 進入聊天室')

        if (usernames.indexOf(data) != -1) {

        } else {
            socket.username = data;
            usernames.push(socket.username)
            io.sockets.emit('usernames', usernames)

        }
    })

    // 輸入事件
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        })
    })
    // 停止輸入事件
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing')
    })

    // 發送訊息
    socket.on('send message', (data) => {
        if (!data) {

        } else {
            io.sockets.emit('new message', { msg: data, nick: socket.username })
        }
        // 非正常使用者強制退出操作
        if (!socket.username) {
            setTimeout(() => socket.emit('force logout'), 500)
            return
        }
    })


    // 上傳圖片
    socket.on('send image', (data) => {
        io.sockets.emit('receive image', data);
    });

    // 停止連線
    socket.on('disconnect', (data) => {
        console.log(`socket ${socket.id} disconnected`)

        io.to(socket.id).emit('user disconnected', socket.username)
        io.sockets.emit('chat', 'SERVER', socket.username + ' 離開了聊天室')
        usernames.splice(usernames.indexOf(socket.username), 1)

    })
})

server.listen(port, () => {
    console.log(`Chat Simple on port ${port}`);
})