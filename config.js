/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-09-27 15:22:47
 * @LastEditors: kusachan 3253975221@qq.com
 * @LastEditTime: 2026-04-07 20:11:47
 * @FilePath: \express-mongoose\config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const path = require("path")
module.exports = {
  host: '127.0.0.1',
  root: process.cwd(),
  port: 3000,
  keyPath: path.join(process.cwd(), '/auth'),
  pubKeyPath: path.join(process.cwd(), '/auth/public.cer'),
  priKeyPath: path.join(process.cwd(), '/auth/private.cer'),
  userPath: path.join(process.cwd(), '/user/user.json'),
  uploadPath: path.join(process.cwd(), '/public'),
  uploadURL: process.env.UPLOAD_URL || 'http://127.0.0.1:3000/',
  maxFileSize: 10240000
}