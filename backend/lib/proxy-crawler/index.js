const log=require("../logger")

const zeroFrame=require("../zero-frame")
const url=require("../url-formatter")
const w=require("../w.js")

function siteCrawler(set,cb) {
  zeroFrame(set,(e,z) => {
    if (e) return cb(e)
    log.cycle("Crawl proxy "+set.host)
    console.log(set)
    //z.onOpenWebsocket=() => {
      z.cmd("siteList",{},(e,res) => { //on public proxies this never get's called! multiuser errors? cookies! TODO: fix this
        if (e) return cb(e)
        const list=res.map(r => {
          return {peers:r.peers,address:r.address}
        })
        log.level(0,"Success")
        z.close()
        return cb(null,{proxy:set.host,list})
      })
    //}
  })
}
const sources=require("../../sources.json").proxies
w(sources,(proxy,next) => {
  siteCrawler(url(proxy),(e,r) => {
    console.log(e,r)
    return next(e,r)
  })
})((err,res) => {
  if (err) throw err
  console.log(res)
})
