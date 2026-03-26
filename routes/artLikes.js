/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-09-27 15:22:50
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-10-18 16:54:36
 * @FilePath: \express-mongoose\routes\artLikes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const router = express.Router();
const Article = require('../models/Article')
const mongoose = require('mongoose')

/* POST 文章点赞/取消点赞 */
router.post('/', async (req, res, next) => {
  const { aid, uid } = req.body;
  console.log('========',uid, aid,'========')
  try {
    if (!uid) {
      return res.status(400).json({ message: '用户ID不能为空' });
    }

    const article = await Article.findById(aid);
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const userObjectId = new mongoose.Types.ObjectId(uid);
    const isLiked = article.like_users.some(id => id.equals(userObjectId));  //some方法只会返回true/false
    
    let message = '';
    if (isLiked) {
      // 取消点赞
      article.like_users = article.like_users.filter(id => !id.equals(userObjectId));   //filter会去掉回调结果为false的数
      message = '取消点赞成功';
    } else {
      // 点赞
      article.like_users.push(userObjectId);
      message = '点赞成功';
    }
    console.log('点赞的消息是:::::',message)
    
    // 更新点赞数量
    article.like_num = article.like_users.length;
    
    // 保存到数据库
    const result = await article.save();
    
    res.status(200).json({
      message,
      data: {
        likes: result.like_num,
        is_liked: !isLiked
      }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;