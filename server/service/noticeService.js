const model = require('../model')
const Notice = model.getModel('notice')

var findMatchWeekend = () => new Promise((resolve,reject)=>{
    var time = new Date().getTime() - 1000 * 60 * 60 * 24 * 7
    Notice.find({ status: 0 }).where('create_time').gt(time)
        .sort({ 'create_time': -1 }).limit(10).exec(function (err, doc) {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
})
var saveNotice = obj => new Promise((resolve,reject)=>{
    const noticeModel = new Notice(obj)
    noticeModel.save(function (err, doc) {
        if (err) {
            reject(err)
        }
        resolve(doc)
    })
})

module.exports = {
    findMatchWeekend,
    saveNotice
}