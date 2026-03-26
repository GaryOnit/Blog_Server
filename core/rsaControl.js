const { decrypt, encrypt } = require('./util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { pubKeyPath, priKeyPath } = require('../config')

//既有同步方法也有异步方法
module.exports = {
    getPublicKeySync() {
        let res = fsSync.readFileSync(pubKeyPath, 'utf8')
        return res;
    },

    getPrivateKeySync() {
        let res = fsSync.readFileSync(priKeyPath, 'utf8')
        return res;
    },

    async getPublicKey() {
        let key;
        try {
            key = await fs.readFile(pubKeyPath, 'utf8')
        } catch (err) {
            //....错误处理
        }
        return key;
    },

    async getPrivateKey() {
        let key;
        try {
            key = await fs.readFile(priKeyPath, 'utf8')
        } catch (err) {
            //....错误处理
        }
        return key;
    }
}