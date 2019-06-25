const model = require('../model')
const User = model.getModel('user')

var findUsersInGroup = openidArr => new Promise((resolve,reject)=>{
    User.find({ openid: { $in: openidArr } }).exec(function(err,doc){
        if(err){
            reject(err)
        }
        resolve(doc)
    })
})
var findUser = obj => new Promise((resolve,reject)=>{
    User.findOne(obj, function (err, doc) {
        if(err){
            reject(err)
        }
        resolve(doc)
    })
})
var saveUser = obj => new Promise((resolve,reject)=>{
    const userModel = new User(obj)
    userModel.save(function (err, doc) {
        if (err) {
            reject(err)
        }
        resolve(obj)
    })
})
var updateOneUser = (keyObj,setObj) => new Promise((resolve,reject)=>{
    User.updateOne(keyObj, { '$set': setObj }, function (err, doc) {
        if(err){
            reject(err)
        }
        resolve(doc)
    })
})

module.exports = {
    findUsersInGroup,
    findUser,
    saveUser,
    updateOneUser
}