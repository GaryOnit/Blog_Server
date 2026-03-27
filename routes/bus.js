const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const assert = require('http-assert')
const qs = require('qs')
// 分页工具函数
const { pagination } = require('../core/util/util')
// 引入各个功能的映射配置文件
const POPULATE_MAP = require('../plugins/POPULATE_MAP')    
const POP_POST_MAP = require('../plugins/POP_POST_MAP')    
const POP_GET_MAP = require('../plugins/POP_GET_MAP')      
const POP_PUT_MAP = require('../plugins/POP_PUT_MAP')      
const RESOURCE_POST_MAP = require('../plugins/RESOURCE_POST_MAP') 

// 【POST】创建资源
router.post('/', async (req, res, next) => {
  try {
    let modelName = req.Model.modelName, body = req.body
    // 1. 预处理：如果配置了加工函数（如自动添加作者ID），则处理 body
    if (modelName in RESOURCE_POST_MAP) {
      body = RESOURCE_POST_MAP[modelName]['body'](body, req._id)
    }
    // 2. 执行创建
    const result = await req.Model.create(body)
    // 3. 联动：如果配置了联动（如发布评论后自动增加文章评论数），执行对应的数据库操作
    if (modelName in POP_POST_MAP) {
      let item = POP_POST_MAP[modelName]
      let { _refId, _model, queryAct, options } = item
      let _id = result._id
      let refId = result?.[_refId] // 找到关联的父级ID
      assert(refId, 422, `${_refId} 必填`)
      await _model[queryAct](refId, options(_id)) // 更新父级文档
    }
    res.send(200, {
      message: '提交成功',
      data: { id: result._id }
    })
  } catch (err) {
    next(err || createError(400, '添加失败'))
  }
})

// 【PUT】更新资源
router.put('/:id', async (req, res, next) => {
  let putData = req.body
  let modelName = req.Model.modelName
  let id = req.params.id 
  let isPass = req.isPass // isPass通过JWT校验得到
  let userId = req._id   // 当前登录用户ID

  try {
    // 1. 权限校验：检查该模型是否允许修改，以及当前用户是否有权修改该条数据
    let { revisable, authField } = POP_PUT_MAP[modelName]
    let isValidate = (modelName in POP_PUT_MAP) && isPass
    assert(isValidate, 400, "无权修改")
    let data = await req.Model.findById(id)
    assert(data, 404, "资源不存在")
    // 校验数据归属权：只有作者本人能改
    assert.equal(userId, data?.[authField], 400, '无权修改')

    // 2. 字段过滤：只允许修改配置表 'revisable' 中声明的字段（防止恶意篡改其他字段）
    let updateData = Object.entries(putData).filter(([key, value]) => {
      return revisable.includes(key)
    })
    isValidate = updateData.length !== 0
    assert(isValidate, 400, '修改失败')
    
    updateData = Object.fromEntries(updateData)
    updateData['date'] = new Date().toISOString() // 更新时间戳
    await req.Model.findByIdAndUpdate(id, updateData)
    res.send(200, { message: '修改成功' })
  } catch (err) {
    next(err)
  }
})

// 【DELETE】删除资源
router.delete('/:id', async (req, res) => {
  await req.Model.findByIdAndDelete(req.params.id)
  res.send({ errMsg: 'ok' })
})

// 【GET】查询列表（支持分页、搜索、关联填充）
router.get('/', async (req, res, next) => {
  let modelName = req.Model.modelName
  let { options = {}, page = 1, size = 100, query = {}, dis = 8, populate = {} } = req.query
  page = Number(page)
  size = Number(size)
  dis = Number(dis)
  query = qs.parse(query) // 解析查询字符串

  // 1. 模糊搜索：如果带有 q 参数，执行标题或内容的全局正则搜索
  if (query.q) {
    let regexp = new RegExp(query.q, 'i')
    query = {
      $or: [
        { title: { $regex: regexp } },
        { content: { $regex: regexp } }
      ]
    }
  }
  try {
    // 2. 关联填充：从 POPULATE_MAP 获取该模型需要填充的字段（如查询文章时带出作者信息）
    if (modelName in POPULATE_MAP) {
      populate = POPULATE_MAP[modelName]
    }
    // 3. 执行分页查询
    let result = await pagination({ model: req.Model, query, options, populate, size, page, dis })
    res.send(200, { message: "ok", data: result })
  } catch (err) {
    console.error('GET列表错误:', err)
    next(createError(422, err.message || "获取失败"))
  }
})

// 【GET】查询详情（支持点击量自动加1）
router.get('/:id', async (req, res) => {
  let modelName = req.Model.modelName
  let _id = req.params.id
  try {
    // 1. 获取基础数据并按配置进行字段填充 (Populate)
    let result = req.Model.findById(_id)
    if (modelName in POPULATE_MAP) {
      let populates = POPULATE_MAP[modelName]
      result = result.populate(populates)
    }
    result = await result.exec()
    
    // 2. 触发获取时的行为（如文章点击量 hit_num +1）
    if (modelName in POP_GET_MAP) {
      let { queryAct, options } = POP_GET_MAP[modelName]
      await req.Model[queryAct](_id, options())
    }

    res.send(200, { message: '查询成功', data: result })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router