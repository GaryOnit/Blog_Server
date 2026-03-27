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
let webSocketServer = http.Server(app)
let socketIo = require('socket.io')
let io = socketIo(webSocketServer, { transports: ['websocket'] })
let { formateDate } = require('./core/util/util')

// [uid, socket] 对每个用户维护一个socket连接
const users = {}

//处理事件: enterChat, login, send 
io.on('connection', (socket) => {
  console.log('有新客户端连接:', socket.id);
  
  //online
  socket.on('online', ({ uid, nickname }) => {
    if (users[uid] && users[uid].socket.id !== socket.id) {
      users[uid].socket.disconnect()
    }
    users[uid] = {
      uid,
      nickname,
      socket: socket,
    }
    socket.uid = uid
    socket.ghost = false
  })

  //enterChat
  socket.on('enterChat', ({ uid = createTempId(), nickname }) => {
    io.sockets.emit('logged', nickname)
    //如果已登录用户，直接返回
    if (users[uid]) {
      return
    }
    //如果未登录用户，创建临时的身份信息
    users[uid] = {
      uid,
      nickname,
      socket: socket,
    }
    socket.uid = uid
    socket.ghost = true
  })

  //leaveChat
  socket.on('leaveChat', () => {
    let uid = socket.uid
    //游客断开连接
    if (socket.ghost) {
      socket.disconnect()
      delete users[uid]
    }
    //已登录用户正常退出
    io.sockets.emit('logout', users[uid]?.nickname)
  })

  //disconnect
  socket.on('disconnect', () => {
    let uid = socket.uid
    delete users[uid]
  })

  socket.on('send', (msg) => {
    let nickname = users[socket['uid']]['nickname']
    socket.broadcast.emit('chat', {
      nickname,
      msg: msg,
      time: formateDate()
    })
  })
});

function createTempId () {
  return Date.now() + Math.random().toString(36).slice(-6)
}

webSocketServer.listen(4000, () => {
  console.log('websocket聊天室开启===端口4000===');
});

module.exports = webSocketServer