/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-16 16:24:57
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-06-17 16:40:45
 * @FilePath: \blog-server\plugins\POP_GET_MAP.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Article": {
    "queryAct": "findByIdAndUpdate", //行为
    "options": function () { //操作内容
      return {
        "$inc": {
          "hit_num": 1 //GET一篇文章时增加点击数
        }
      }
    }
  }
}
