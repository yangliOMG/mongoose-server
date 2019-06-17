const mongoose = require('mongoose')
//连接mongo 并且使用imooc这个集合
const DB_URL = 'mongodb://localhost:27017/nomal'
mongoose.connect(DB_URL)

const models = {
    user:{
        'openid':{type:String, require:true},
        'nickName':{type:String},
        'avatarUrl':{type:String},
    },
    match:{
        'openid':{type:String, require:true},
        'avatarUrl':{type:String, require:true},
        'nickName':{type:String},
        'date':{type:String},
        'time':{type:String},
        'timelong':{type:String},
        'number':{type:Number},
        'locaaddr':{type:String},
        'locaname':{type:String},
        'explain':{type:String},
        'create_time':{type:Number,default:new Date().getTime()},
        'end_time':{type:Number,default:new Date().getTime()},
        'status':{type:Number,default:0},   //0正常，1 过期， 2 删除
        'group':{type:String},
        'groupArr':{type:Array}
    },
    notice:{
        'avatarUrl':{type:String, require:true},
        'nickName':{type:String},
        'date':{type:String},
        'create_time':{type:Number,default:new Date().getTime()},
        'status':{type:Number,default:0},   //0正常，1 过期， 2 删除
    }
}

for (let m in models) {
    mongoose.model(m, new mongoose.Schema(models[m]))
}

module.exports = {
    getModel : function (name) { 
        return mongoose.model(name)
    }
}