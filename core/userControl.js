/*
 * @Author: Garyonit 3253975221@qq.com
 * @Date: 2025-03-30 14:31:55
 * @LastEditors: Garyonit 3253975221@qq.com
 * @LastEditTime: 2025-06-16 16:37:37
 * @FilePath: \黄俊霖_node_20250330\my-express\core\userControl.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { decrypt, encrypt, generateKeys } = require('./util/util')
const fs = require('fs').promises
const { userPath } = require('../config')
const { getUserStatusMsg } = require('./statusControl')

//一些在本模块内用的工具函数
//把user.json读取出来然后转为json对象数组
async function getUserArr() {
    let userArr = await fs.readFile(userPath, 'utf8')
    userArr = JSON.parse(userArr)
    //返回一个数组
    return userArr;
}
//设置新的user.json内容
async function setUserArr(users) {
    try {
        await fs.writeFile(userPath, JSON.stringify(users), 'utf8')
        return true
    } catch (err) {
        //....错误处理
        return false
    }
}
//增加新的user(步骤是先拿出原数组, 修改完之后再重新写入)
async function appendUser({ user_id, user_name, password }) {
    if (!user_id || !user_name || !password) {
        return false;
    }
    //增加一个新user
    let userArr = await getUserArr()
    userArr.push({
        user_id, user_name, password
    })
    await setUserArr(userArr)
    return true
}

//用来计算user_id
async function getUsersNum() {
    let userArr = await getUserArr()
    return userArr?.length
}

module.exports = {
    //获取用户
    async getUserInfo(username) {
        try {
            let userArr = await getUserArr();
            //在userArr中找到对应的user
            let userInfo = userArr.find(item => item['user_name'].trim() === username.trim())
            //没有找到
            if (!userInfo) {
                return {
                    ...getUserStatusMsg('USER_NOF')
                }
            }
            else return {
                ...getUserStatusMsg('USER_FOND'),
                data: {
                    ...userInfo //包括user_name, user_id, password
                }
            }
        } catch (err) {
            //....错误处理
            return {
                ...getUserStatusMsg('USER_FERR'),
            }
        }
    },
    //添加用户
    async addUser({ username, password }) {
        //加密
        password = await encrypt(password)
        //查看数据库是否存在同名用户 
        let user = await this.getUserInfo(username)
        //没找到代表用户不存在
        if (user?.['tag'] === 'USER_NOF') {
            let userNum = await getUsersNum()
            //计算userId
            let userId = ('000000' + userNum).substr(-6)
            //传入需要的参数,增加一个新的用户
            await appendUser({ user_id: userId, user_name: username, password:password })
            //返回对应状态信息
            return {
                ...getUserStatusMsg('USER_ADD')
            }
        }
        //用户已经存在
        else if (user?.['tag'] === 'USER_FOND') {
            //返回对应状态信息
            return {
                ...getUserStatusMsg('USER_DR')
            }
        }
        else return {
            statusCode: user.statusCode,
            errMsg: '注册失败'
        }
    },

    //验证Token信息
    async verifyToken(username, userID) {
        try {
            let userArr = await getUserArr();
            //从数组中找到对应的用户
            let user = userArr.find(item => item['user_id'].trim() === userID.trim())
            //用户不存在
            if (!user) {
                return {
                    ...getUserStatusMsg('USER_NOF')
                }
            }
            //用户找到了, 判断一下名字相不相同
            if (user['user_name'] === username) {
                return {
                    ...getUserStatusMsg('USER_FOND'),
                }
            }
        } catch (err) {
            return {
                ...getUserStatusMsg('USER_FERR'),
            }
        }
    },
    //验证用户 账号密码
    async verifyUser({username, password}) {
        let user = await this.getUserInfo(username)
        //如果没有找到用户
        if (user?.['tag'] !== 'USER_FOND') {
            return user
        }
        //找到用户
        let { user_id, user_name } = user.data
        let storagePassword = user.data.password
        //验证密码 库中存储二次加密 和传输 一次加密 对比
        let isVerified = await decrypt(await decrypt(storagePassword.trim())) === await decrypt(password.trim())
        if (isVerified) {
            //密码正确, 返回状态信息和数据
            let res = {
                ...getUserStatusMsg('USER_INN'),
                data: {
                    user_id, user_name
                }
            }
            return res
        }
    }
}