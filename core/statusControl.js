const userTtC = {
    'USER_ADD': "4010",
    'USER_TRIM': '4012',
    'USER_DR': "4016",
    'USER_NOF': "4012",
    'USER_FOND': "4013",
    'USER_INN': '4020',
    'USER_LOGIN': "4021",
    'USER_FERR': "4099",
}
const userCtM = {
    '4010': '用户注册成功',
    '4012': '用户名或密码不能为空',
    '4016': '用户已存在',
    '4012': '用户不存在',
    '4013': '用户查询成功',
    '4020': '账号密码验证成功',
    '4021': '登录成功',
    '4099': '用户查询错误',
}


module.exports = {
    //传入一个状态字符串
    getUserStatusMsg(tag) {
        if (!tag) {
            return false
        }
        //对应的状态码
        let statusCode = userTtC[tag]
        //对应的状态信息
        let errMsg = userCtM[statusCode]
        return {
            statusCode, 
            errMsg,
            tag
        }
    }
}
