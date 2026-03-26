const express = require('express');
const router = express.Router();
const { decrypt, encrypt } = require('../core/util/util')
const { sendToken } = require('../core/sendToken')
const User = require('../models/User');
const assert = require('http-assert');

const CLASSIFY_MAP = {
  'login': "login",
  'register': "register"
}

router.post('/:classify', async (req, res, next) => {
  let { username, password } = req.body
  let { classify } = req.params

  let user, isClassPass = classify in CLASSIFY_MAP
  assert(isClassPass, 400, '无效的请求')
  try {
    if (!username || username?.trim()?.length === 0 || !password || password?.trim()?.length === 0) {
      assert(false, 422, "账号密码必填")
    }
    if (classify === 'login') {
      //连同password一起返回
      user = await User.findOne({ username }).select('+password')
      assert(user, 422, "用户不存在")
      //校验密码
      assert.equal(decrypt(password), decrypt(decrypt(user.password)), 422, '账号密码错误')
    }
    if (classify === 'register') {
      user = await User.create(req.body)
    }
    //生成token
    let token = await sendToken(user)
    res.send(200, {
      message: '登录成功',
      data: {
        userId: user._id,
        token: token//返回token
      }
    })
  } catch (err) {
    next(err)//在底部导航栏显示
  }
});

module.exports = router;