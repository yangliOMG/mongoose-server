const model = require('../model')
const Match = model.getModel('match')

var findMatchByOpenid = openid => new Promise((resolve,reject)=>{
    Match.find({openid}).where('status').ne(2).sort({'create_time':-1}).exec(function(err,doc){
        if(err){
            reject(err)
        }
        doc = doc[0]
        resolve(doc)
    })
})
var findMatchByOpenidInGroup = openid => new Promise((resolve,reject)=>{
    Match.find( {group: {$regex : new RegExp(openid) } } )
        .where('status').ne(2)
        .sort({'create_time':-1}).exec(function(err,doc){
        if(err){
            reject(err)
        }
        doc = doc[0]
        resolve(doc)
    })
})
var updateOneMatch = (keyObj,setObj) => new Promise((resolve,reject)=>{
    Match.updateOne(keyObj,{'$set':setObj},function(err,doc){
        if(err){
            reject(err)
        }
        resolve(doc)
    })
})
var findMatch = obj => new Promise((resolve,reject)=>{
    Match.findOne( obj, function (err, doc) {
        if(err){
            reject(err)
        }
        resolve(doc)
    })
})
var saveMatch = obj => new Promise((resolve,reject)=>{
    const matchModel = new Match(obj)
    matchModel.save(function (err, doc) {
        if (err) {
            reject(err)
        }
        resolve(obj)
    })
})

module.exports = {
    findMatchByOpenid,
    findMatchByOpenidInGroup,
    updateOneMatch,
    findMatch,
    saveMatch
}