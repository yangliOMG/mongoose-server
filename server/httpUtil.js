const https = require('https')

var doGet = URL => new Promise((resolve,reject)=>{
    https.get(URL, (res) => {
        res.setEncoding('utf8')
        res.on('data', (d) => {
            resolve(d)
        });
    }).on('error', (e) => {
        reject(e)
    })
})

module.exports = {
    doGet
}