const express = require('express')

const Router = express.Router()
const model = require('./model')
const User = model.getModel('user')
const Match = model.getModel('match')
const Notice = model.getModel('notice')
const matchService = require('./service/matchService')
const userService = require('./service/userService')
const noticeService = require('./service/noticeService')
const wxService = require('./service/wxService')

Router.get('/wxMiniLogin.do',async function (req, res) {
    const { code } = req.query
    const r = await wxService.getOpenidByCode(code)
    var resObj = JSON.parse(r)
    if (r.indexOf("\"errcode\"") < 0) {
        var { openid, session_key } = resObj
        res.cookie('session_key', session_key)
        let user = await userService.findUser({openid})
        if(!user || !user._id){
            user = await userService.saveUser({openid})
            if (!user || !user._id) {
                return res.json({ code: 1, msg: '后端出错了' })
            }
        }
        return res.json({ code: 0, data: user })
    } else {
        return res.json({ code: 1, msg: resObj.errmsg })
    }
})
Router.post('/create.do', async function (req, res) {
    const { avatarUrl, nickName, date, time, timelong, number,
        locaaddr, locaname, explain, end_time, openid } = req.body
    let user = await userService.findUser({openid})
    if(!user || !user._id){
        userService.saveUser({ openid, avatarUrl, nickName })
    }else{
        userService.updateOneUser({ openid },{ avatarUrl, nickName } )
    }

    let match = await matchService.findMatch({ openid, status: 0 })
    if (match && match._id) {
        return res.json({ code: 1, msg: '有比赛在进行中' })
    }
    const group = openid + ','
    matchService.saveMatch({
        avatarUrl, nickName, date, time, timelong, number,
        locaaddr, locaname, explain, end_time, openid, group
    })
    return res.json({ code: 0, msg: '保存成功' })
})
Router.get('/get.do', async function (req, res) {
    const { openid } = req.query
    let match = await matchService.findMatchByOpenid(openid)
    if (!match || !match._id) {
        match = await matchService.findMatchByOpenidInGroup(openid)
        if (!match || !match._id) {
            return res.json({ code: 1, msg: 'match为空' })
        }
    }
    var openidArr = match.group.split(',').slice(0, -1)
    let users = await userService.findUsersInGroup(openidArr)
    if (!users[0]) {
        return res.json({ code: 1, msg: 'find openidArr失败' })
    }
    match.groupArr = openidArr.map(v => (users.find(i => i.openid == v)))

    if (match.end_time < new Date().getTime() && match.status == 0) {
        matchService.updateOneMatch({ _id: match._id }, { status: 1 })
        match.status = 1
    }
    return res.json({ code: 0, data: match })
})

Router.get('/getbyid.do', async function (req, res) {
    const { id } = req.query
    let match = await matchService.findMatch({ _id: id })
    if (!match || !match._id) {
        return res.json({ code: 1, msg: 'getbyid失败' })
    }
    var openidArr = match.group.split(',').slice(0, -1)
    let users = await userService.findUsersInGroup(openidArr)
    if (!users[0]) {
        return res.json({ code: 1, msg: 'find openidArr失败' })
    }
    match.groupArr = openidArr.map(v => (users.find(i => i.openid == v)))
    return res.json({ code: 0, data: match })
})
Router.post('/join.do', async function (req, res) {
    const { _id, openid, avatarUrl, nickName } = req.body
    userService.updateOneUser({ openid },{ avatarUrl, nickName } )

    let match = await matchService.findMatch({ _id: id })
    if (!match || !match._id) {
        return res.json({ code: 1, msg: match })
    }
    var openidArr = match.group.split(',').slice(0, -1)
    if (openidArr.find(id => id == openid)) {
        return res.json({ code: 0, msg: '你已报名' })
    } else {
        var group = match.group + openid + ','
        let msg = await matchService.updateOneMatch({ _id }, { group })
        if (msg.ok!=1) {
            return res.json({ code: 1, msg: 'update失败' })
        }
        return res.json({ code: 0, msg: '报名成功' })
    }
})
Router.post('/delete.do', async function (req, res) {
    const { _id } = req.body
    let msg = await matchService.updateOneMatch({ _id }, { status: 2 })
    if (msg.ok!=1) {
        return res.json({ code: 1, msg: 'update失败' })
    }
    return res.json({ code: 0, msg: '删除成功' })
})
Router.post('/notjoin.do', async function (req, res) {
    const { date, avatarUrl, nickName } = req.body
    let notice = await noticeService.saveNotice({ date, avatarUrl, nickName })
    if (!notice._id) {
        return res.json({ code: 1, msg: 'save notice出错' })
    }
    return res.json({ code: 0, msg: '操作成功' })
})
Router.get('/getNotice.do', async function (req, res) {
    let notices = await noticeService.findMatchWeekend()
    if (Object.prototype.toString.call(notices) != "[object Array]") {
        return res.json({ code: 1, msg: 'find notices失败' })
    }
    return res.json({ code: 0, data: notices })
})
Router.get('/test.do', async function (req, res) {
    var arr = ["okzsQ5e1a-UcskfJzjUG3PfseKXI", '1'], openid = "okzsQ5e1a-UcskfJzjUG3PfseKXI"
    let match = await matchService.findMatchByOpenid( openid)
    return res.json({ code: 0, data: match })
})

module.exports = Router