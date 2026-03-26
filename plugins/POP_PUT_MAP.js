/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-16 16:24:57
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-06-17 16:32:50
 * @FilePath: \blog-server\plugins\POP_PUT_MAP.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//限制修改权限
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Article": {
    "revisable": ["title", "cover", "content"],
    "authField": "author"
  },
  "User": {
    "revisable": ["password", "email", "nickname"],
    "authField": "_id"
  },
  "Comment": {
    "revisable": ["content"],
    "authField": "uid"
  },
  "Column": {
    "revisable": ["name"],
    "authField": "uid"
  }
}
