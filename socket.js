/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-10-31 21:20:48
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-11-08 20:06:02
 * @FilePath: \express-mongoose\socket.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var app = require('./app');
var http = require('http');
let socketIo = require('socket.io')
let { formateDate } = require('./core/util/util')

const users = {}

function initSocket(server) {
  let io = socketIo(server, {
    transports: ['websocket', 'polling'],
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    console.log('有新客户端连接:', socket.id);

    socket.on('online', ({ uid, nickname }) => {
      if (users[uid] && users[uid].socket.id !== socket.id) {
        users[uid].socket.disconnect()
      }
      users[uid] = { uid, nickname, socket }
      socket.uid = uid
      socket.ghost = false
    })

    socket.on('enterChat', ({ uid = createTempId(), nickname }) => {
      io.sockets.emit('logged', nickname)
      if (users[uid]) return
      users[uid] = { uid, nickname, socket }
      socket.uid = uid
      socket.ghost = true
    })

    socket.on('leaveChat', () => {
      let uid = socket.uid
      if (socket.ghost) {
        socket.disconnect()
        delete users[uid]
      }
      io.sockets.emit('logout', users[uid]?.nickname)
    })

    socket.on('disconnect', () => {
      delete users[socket.uid]
    })

    socket.on('send', (msg) => {
      let nickname = users[socket.uid]?.nickname
      if (!nickname) return
      socket.broadcast.emit('chat', { nickname, msg, time: formateDate() })
    })
  })
}

function createTempId() {
  return Date.now() + Math.random().toString(36).slice(-6)
}

module.exports = initSocket