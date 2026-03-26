/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-05-24 18:19:25
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-05-24 18:27:06
 * @FilePath: \黄俊霖_node_20250523\express-Mongoose\core\sendToken.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD
 */
const { decrypt, encrypt, generateKeys } = require('./util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { pubKeyPath, priKeyPath } = require('../config')
const { getPrivateKey } = require('../core/rsaControl')
const jwt = require('jsonwebtoken') //token生成包  JWT

module.exports = {
  async sendToken (userInfo) {
    let { username, _id } = userInfo
    let privateKey = await getPrivateKey()
    let token = jwt.sign({ username, _id, exp: ~~((Date.now() / 1000) + 24 * 3600 * 3) }, privateKey, { algorithm: 'RS256' });
    return token
  }
}