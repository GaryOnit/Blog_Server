/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-16 16:24:57
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-10-09 17:15:04
 * @FilePath: \blog-server\routes\upload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const router = express.Router();
const assert = require('http-assert');
const multer = require("multer");
const { uploadPath, uploadURL, maxFileSize } = require('../config');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // 引入User模型

// 专门处理用户头像上传的存储配置
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {  // 修正参数名：file 不是 res
    const {uid} = req.body;
    assert(uid, 422, '用户UID必填');
    
    // 创建用户专属目录: uploadPath/user/{uid}/
    const userDir = path.join(uploadPath, 'user', uid);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // 清空目录下的旧头像文件
    fs.readdirSync(userDir).forEach(file => {
      fs.unlinkSync(path.join(userDir, file));
    });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // 固定命名为avatar.jpg
    cb(null, 'avatar.jpg');
  }
});

// 用户头像上传配置
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 用户头像上传路由
router.post('/user', avatarUpload.single('file'), async (req, res, next) => {
  try {
    const {uid} = req.body;
    assert(uid, 422, '用户UID必填');
    assert(req.file, 400, '请选择要上传的头像文件');
    
    const fileURL = `${uploadURL}/user/${uid}/avatar.jpg`;
    
    // 更新数据库中的用户头像
    const user = await User.findByIdAndUpdate(
      uid,
      { avatar: fileURL },
      { new: true }
    );
    assert(user, 404, '用户不存在');
    
    res.status(200).json({
      message: "头像上传成功",
      data: {
        avatarURL: fileURL
      }
    });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path); // 删除错误文件
    }
    next(err);
  }
});

//文章封面上传路由
const articleStorage = multer.diskStorage({
  //存储位置
  destination (req, res, cb) {
    let fileType = 'article';
    const filePath = path.join(uploadPath, fileType)
    fs.existsSync(filePath) || fs.mkdirSync(filePath);
    cb(null, filePath);
  },
  filename (req, file, cb) {
    const { ext, base, name } = path.parse(file.originalname)
    cb(null, name + '_' + Date.now() + ext);
  }
});

const articleUpload = multer({
  storage: articleStorage,
  limits: {
    fileSize: maxFileSize
  }
})

router.post('/article', articleUpload.single('file'), async (req, res, next) => {
  try {
    let fileType = 'article'
    assert(fileType, 400, '文件上传分类不正确')
    let { destination, filename } = req.file
    let fileURL = path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://')

    res.send(200, {
        "errno": 0,
        data: [fileURL]
      })
  } catch (err) {
    next(err)
  }
})

module.exports = router;