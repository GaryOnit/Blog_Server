/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-06-16 16:24:54
 * @LastEditors: kusachan 3253975221@qq.com
 * @LastEditTime: 2026-03-15 11:10:16
 * @FilePath: \blog-server\core\util\util.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs');
const path = require('path');
const NodeRSA = require('node-rsa');
const { priKeyPath, pubKeyPath } = require('../../config');
const { compile } = require('morgan');
const mongoPage = require('mongoose-sex-page')
const qs = require('qs')

//生成公钥和私钥
function generateKeys () {
  const newkey = new NodeRSA({ b: 2048 });
  let public_key = newkey.exportKey('pkcs1-public')//公钥,
  let private_key = newkey.exportKey('pkcs1-private') //私钥

  fs.writeFileSync(priKeyPath, private_key);
  fs.writeFileSync(pubKeyPath, public_key);
}
//加密函数
function encrypt (plain) {
  let public_key = fs.readFileSync(pubKeyPath, 'utf8');
  const nodersa = new NodeRSA(public_key);
  return nodersa.encrypt(plain, 'base64');
}
//解密函数
function decrypt (cipher) {
  let private_key = fs.readFileSync(priKeyPath, 'utf8'); //私钥
  let nodersa = new NodeRSA(private_key);
  return nodersa.decrypt(cipher, 'utf8')
}

async function pagination ({ model, query, options, populate = {}, size, page, dis }) {
  if (typeof query === 'string') {
    query = qs.parse(query)
  } 
  let result = await mongoPage(model).find(query).populate(populate).select(options).size(size).page(page).display(dis).exec()

  let { total, records: list, pages, display } = result
  //count 当次返回的 list的长度 数据数量
  let count = list.length
  return { count, page, size, total, list, pages, display }
}

//填充数字
function toDouble (num) {
  return String(num)[1] && String(num) || '0' + num;
}

//规范化日期
function formateDate (date = new Date(), format = "yyyy年MM月dd日 hh:mm:ss") {
  let regMap = {
    'y': date.getFullYear(),
    'M': toDouble(date.getMonth() + 1),
    'd': toDouble(date.getDate()),
    'h': toDouble(date.getHours()),
    'm': toDouble(date.getMinutes()),
    's': toDouble(date.getSeconds()),
  }

  //逻辑(正则替换 对应位置替换对应值) 数据(日期验证字符 对应值) 分离
  return Object.entries(regMap).reduce((acc, [reg, value]) => {
    return acc.replace(new RegExp(`${reg}+`, 'g'), value);
  }, format);
}


//generateKeys()

module.exports = {
  encrypt,
  decrypt,
  pagination,
  formateDate
};