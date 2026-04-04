const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const mongoose = require('./plugins/db')
const assert = require('http-assert')
const User = require('./models/User')
const { maxFileSize } = require('./config')
const expressJwt = require('express-jwt')
const { getPublicKeySync } = require('./core/rsaControl')

require('dotenv').config();

require('./socket')

const app = express();

app.use(cors({
  "origin": true, //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
//中间件  nameMiddleware
const resourceMiddleware = require('./middleware/resource')

//路由  nameRoute
const busRoute = require('./routes/bus');
const adminRoute = require('./routes/admin');
const pubKeyRoute = require('./routes/getPubKey')
const uploadRoute = require('./routes/upload')
const searchRoute = require('./routes/search')
const artLikesRoute = require('./routes/artLikes');
const userRoute = require('./routes/user')
const aiRoute = require('./routes/ai')
const { send } = require('process');

app.use(expressJwt({
  secret: getPublicKeySync(), //公钥
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async (req, payload, next) => {
    let { _id } = payload//从payload中解析出id
    req._id = _id
    req.isPass = true
    try {
      let result = await User.findById(_id)
      if (!result) {//token已经被吊销
        req.isPass = false
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}).unless({//访问这些路由时不必验证token
  path: [
    { url: /\/api\/rest/, methods: ['GET'] },
    { url: /\/admin\// },
    { url: /\/upload\// },
    { url: '/keys' },
    { url: '/articles/search' },
    { url: '/articles/likes' },
    { url: /\/api\/ai\// },
  ]
}))
//首页
app.use('/index', (req, res, next) => {
  if (req.isPass) {
    res.send(200, {
      message: 'ok'
    })
  } else {
    res.send(401, {
      message: '请先登录'
    })
  }
})

//用户信息
app.use('/user', userRoute)

//资源路由
app.use('/api/rest/:resource', resourceMiddleware(), busRoute)

//登录注册
app.use('/admin', adminRoute)

//获取公钥
app.use('/keys', pubKeyRoute)

//文件上传
app.use('/upload', uploadRoute)

//文章搜索
app.use('/articles/search', searchRoute)

//文章点赞
app.use('/articles/likes', artLikesRoute)

//AI 对话
app.use('/api/ai', aiRoute)



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


const ERROR_CODE_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`,
}
const ERROR_STATUS_MAP = {
  '401': "无权限操作,请先登录"
}
const QUE_MAP = {
  "username": "用户名",
  "password": "密码",
  "email": "邮箱",
  "nickname": "昵称",
  "avatar": "头像"
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  if (err.message.indexOf('duplicate key error') !== -1) {
    let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
      return `${QUE_MAP?.[key]}不能重复`
    })[0]
    err.status = 422
    err.message = repeatKey
  }

  if (err.errors) {
    let paramErrors = Object.entries(err.errors).map(([key, val]) => {
      return `${val.message}`
    }).join(',')
    err.status = 422
    err.message = paramErrors
  }

  if (err.code in ERROR_CODE_MAP) {
    err.status = 422
    err.message = ERROR_CODE_MAP[err.code]
  }

  if (err.status in ERROR_STATUS_MAP) {
    err.message = ERROR_STATUS_MAP[err.status]
  }

  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
  // res.render('error');
});


module.exports = app;
