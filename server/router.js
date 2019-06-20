const express = require('express')
const utils = require('utility')

const Router = express.Router()
const model = require('./model')
const httpUtil = require('./httpUtil')
const User = model.getModel('user')
const Match = model.getModel('match')
const Notice = model.getModel('notice')

const appid = 'wx151a98acf0215344'
const appsc = 'a34517864c6750096a52b68eef8c2b27'

Router.get('/wxMiniLogin.do',function(req,res){
    const { code } = req.query
    const URL = "https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code"
                .replace("APPID", appid).replace("SECRET", appsc).replace("CODE", code)
    httpUtil.doGet(URL).then(r=>{
        var resObj = JSON.parse(r)
        if(r.indexOf("\"errcode\"") < 0){
            var {openid, session_key} = resObj
            res.cookie('session_key', session_key)
            User.findOne({openid},function(err,doc){
                if(doc){
                    return res.json({code:0,data:doc})
                }
                const userModel = new User({openid})
                userModel.save(function(e,d){
                    if(e){
                        return res.json({code:1,msg:'后端出错了'})
                    }
                    return res.json({code:0,data:{openid}})
                })
            })
        }else{
            return res.json({code:1,msg:resObj.errmsg})
        }
    })
})
Router.post('/create.do',function(req,res){
    const {avatarUrl, nickName, date, time, timelong, number, 
        locaaddr, locaname, explain, end_time, openid}  = req.body

    User.findOne({openid},function(err,doc){
        if(doc){
            User.update({openid},{'$set':{avatarUrl, nickName}},function(err,doc){
                if(err){
                    return res.json({code:1,msg:'update失败'})
                }
            })
        }else{
            const userModel = new User({openid, avatarUrl, nickName})
            userModel.save(function(e,d){
                if(e){
                    return res.json({code:1,msg:'save用户出错'})
                }
            })
        }
    })
    Match.findOne({openid, status:0},function(err,doc){
        if(doc){
            return res.json({code:1,msg:'有比赛在进行中'})
        }
        const group = openid+','
        const matchModel = new Match({avatarUrl, nickName, date, time, timelong, number, 
            locaaddr, locaname, explain, end_time, openid, group})
        matchModel.save(function(e,d){
            if(e){
                return res.json({code:1,msg:'后端出错了'})
            }
            return res.json({code:0,msg:'保存成功'})
        })
    })
})
Router.get('/get.do',function(req,res){
    const {openid} = req.query
    Match.find({openid}).where('status').ne(2).sort({'create_time':-1}).exec(function(err,doc){
        if(err){
            return res.json({code:1,msg:err})
        }
        doc = doc[0]
        if(doc){
            getOrderAndCount(doc)
        }else{
            Match.find( {group: {$regex : new RegExp(openid) } } )
            .where('status').ne(2)
            .sort({'create_time':-1}).exec(function(err,docc){
                if(err){
                    return res.json({code:1,msg:err})
                }
                docc = docc[0]
                // doc = doc.filter(v=>v.status==0||v.status==1)[0]
                if(docc){
                    getOrderAndCount(docc)
                }else{
                    return res.json({code:1,data:{}})
                }
            })
        }
        function getOrderAndCount(doc){
            var openidArr = doc.group.split(',').slice(0,-1)
            User.find({ openid: { $in: openidArr } }).exec(function(err,arr){
                if(err){
                    return res.json({code:1,msg:'find openidArr失败'})
                }
                doc.groupArr = openidArr.map(v=>(arr.find(i=>i.openid==v)))
                if( doc.end_time < new Date().getTime()){
                    Match.update({_id:doc._id},{'$set':{status:1}},function(err,d){
                        if(err){
                            return res.json({code:1,msg:'update失败'})
                        }
                        doc.status = 1
                        return res.json({code:0,data:doc})
                    })
                }else{
                    return res.json({code:0,data:doc})
                }
            })
        }
    })
})
Router.get('/getbyid.do',function(req,res){
    const {id} = req.query
    Match.findOne({_id:id},function(err,doc){
        if(err){
            return res.json({code:1,msg:'getbyid失败'})
        }
        var openidArr = doc.group.split(',').slice(0,-1)
        User.find({ openid: { $in: openidArr } }).exec(function(err,arr){
            if(err){
                return res.json({code:1,msg:'find openidArr失败'})
            }
            doc.groupArr = openidArr.map(v=>(arr.find(i=>i.openid==v)))
            return res.json({code:0,data:doc})
        })
    })
})
Router.post('/join.do',function(req,res){
    const { _id, openid, avatarUrl, nickName }  = req.body
    User.update({openid},{'$set':{avatarUrl, nickName}},function(err,doc){
        if(err){
            return res.json({code:1,msg:'update失败'})
        }
    })
    Match.findOne({_id}, function(err,doc){
        if(err){
            return res.json({code:1,msg:err})
        }
        var openidArr = doc.group.split(',').slice(0,-1)
        if(openidArr.find(id=>id==openid)){
            return res.json({code:0,msg:'你已报名'})
        }else{
            var group = doc.group + openid + ','
            Match.update({_id},{'$set':{group}},function(err,doc){
                if(err){
                    return res.json({code:1,msg:'update失败'})
                }
                return res.json({code:0,msg:'报名成功'})
            })
        }

    })
})
Router.post('/delete.do',function(req,res){
    const { _id }  = req.body
    Match.update({_id},{'$set':{status:2}},function(err,doc){
        if(err){
            return res.json({code:1,msg:'update失败'})
        }
        return res.json({code:0,msg:'删除成功'})
    })
})
Router.post('/notjoin.do',function(req,res){
    const { date, avatarUrl, nickName }  = req.body
    const noticeModel = new Notice({date, avatarUrl, nickName})
    noticeModel.save(function(e,d){
        if(e){
            return res.json({code:1,msg:'save notice出错'})
        }
        return res.json({code:0,msg:'操作成功'})
    })
})
Router.get('/getNotice.do',function(req,res){
    var time = new Date().getTime() - 1000*60*60*24*7
    Notice.find({status:0}).where('create_time').gt(time)
        .sort({'create_time':-1}).limit(10).exec(function(err,doc){
        if(err){
            return res.json({code:1,msg:err})
        }
        return res.json({code:0,data:doc})
    })
})
Router.get('/test.do',function(req,res){
    var arr = ["okzsQ5e1a-UcskfJzjUG3PfseKXI",'1'], openid = "okzsQ5e1a-UcskfJzjUG3PfseKX3"

    Match.find( {group: {$regex : new RegExp(openid) } } )
    .sort({'create_time':-1}).exec(function(err,doc){
        if(err){
            return res.json({code:1,msg:err})
        }
        console.log("doc",doc)
        return res.json({code:1,data:doc})
    })
})

module.exports = Router