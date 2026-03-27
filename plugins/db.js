//链接mongoose数据库
const mongoose = require('mongoose')

// 不用 SRV Connection String
mongoose.connect("mongodb://3253975221_db_user:HJLhjl3629692@ac-ytjrbvu-shard-00-00.5ukg2ui.mongodb.net:27017,ac-ytjrbvu-shard-00-01.5ukg2ui.mongodb.net:27017,ac-ytjrbvu-shard-00-02.5ukg2ui.mongodb.net:27017/db_blog?ssl=true&replicaSet=atlas-27wx72-shard-0&authSource=admin&appName=Cluster0", )

// 用 SRV Connection String
// mongoose.connect("mongodb+srv://3253975221_db_user:HJLhjl3629692@cluster0.5ukg2ui.mongodb.net/db_blog?appName=Cluster0",{})

let db = mongoose.connection
db.on('error', function (err) {
  console.log('数据库连接失败：', err)
})
db.on('open', function () {
  console.log('      ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗       ')
  console.log('      ████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗      ')
  console.log('█████╗██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║█████╗')
  console.log('╚════╝██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║╚════╝')
  console.log('      ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝    ')
  console.log('      ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ')
  console.log('✅ 已成功连接 云端 MongoDB 数据库！')
})

module.exports = {
  mongoose
}