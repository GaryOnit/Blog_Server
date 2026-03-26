/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-27 13:01:09
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-06-28 13:51:20
 * @FilePath: \黄俊霖_node_20250627\express-mongoose\routes\search.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const assert = require('http-assert');
const { pagination } = require('../core/util/util')


router.get('/', async (req, res, next) => {
  let { q = '' } = req.query
  let regExp = new RegExp(q, 'i')

  let options = "title",
    page = 1,
    size = 100,
    query = {
      $or: [
        { title: { $regex: regExp } },
        { content: { $regex: regExp } },
      ]
    },
    dis = 8

  try {
    let result = await pagination({ model: Article, query, options, size, page, dis })
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (err) {
    next(err)
  }

});

module.exports = router;
