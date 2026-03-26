/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-16 16:24:54
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-07-03 17:58:04
 * @FilePath: \blog-server\models\User.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../core/util/util')

const schema = new mongoose.Schema({
  username: {
    required: [true, '用户名必填'],
    index: true,
    type: String,
    validate: {
      validator (val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,12}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-12位"
    },
    //唯一
    unique: true
  },
  password: {
    type: String,
    select: false,
    required: [true, '密码必填'],
    validate: {
      validator (val) {
        return val !== '密码格式不正确'
      },
      message: "密码必须为 数字+密码(大小写) 8-12位"
    },
    set (val) {
      return encrypt(val) //加密x1
    }
  },
  email: {
    type: String,
    required: [true, '邮箱必填'],
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true
  },
  avatar: {
    type: String, //URL,
    default: "http://127.0.0.1:3000/images/avatar.jpg"
  },

  nickname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    },
    default: '用户' + ~~(Math.random() * 99999) //随机产生一个nickname
  },
  signature:{
    type: String,
    default: '这个人很懒还没有签名...'
  }
})

module.exports = mongoose.model('User', schema)
