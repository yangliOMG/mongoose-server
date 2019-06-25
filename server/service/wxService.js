const httpUtil = require('../httpUtil')

const appid = 'wx151a98acf0215344'
const appsc = 'a34517864c6750096a52b68eef8c2b27'

var getOpenidByCode = code => new Promise((resolve,reject)=>{
    const URL = "https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code"
        .replace("APPID", appid).replace("SECRET", appsc).replace("CODE", code)
    httpUtil.doGet(URL).then(r=>resolve(r))
})

module.exports = {
    getOpenidByCode
}