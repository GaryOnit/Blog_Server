/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-09-27 15:22:47
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-10-18 16:53:18
 * @FilePath: \express-mongoose\models\Article.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const mongoose = require('mongoose')
const { uploadURL } = require('../config')
const {formateDate} = require('../core/util/util')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "默认标题" + new Date().toDateString()
  },
  //封面图
  cover: {
    type: String, //URL
    default: `${uploadURL}article/article-cover.jpg`
  },
  //文章内容
  content: {
    type: String, // URIencode(HTMLCode)
    set (val) {
      try {
        val = decodeURIComponent(`${val}`).replace(/\"/g, "\'")
        return val
      } catch (err) {
        return val
      }
    },
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val){
      return formateDate(new Date(val))
    }
  },
  //点击量
  hit_num: {
    type: Number,
    default: 0
  },
  //评论数量
  comment_num: {
    type: Number,
    default: 0
  },
  //喜欢 点赞
  like_num: {
    type: Number,
    default: 0
  },
  //作者
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User"
  },
  //评论集合
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Comment"
    }
  ],
  //分类
  column: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Column',
    default: "68381c3082cd686650eeeaaa", //默认为测试文章
    required: true
  },
  // 点赞用户列表 - 新增字段
  like_users: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  ]
}, {
  // 启用 getter 和虚拟字段
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
})


module.exports = mongoose.model('Article', schema)