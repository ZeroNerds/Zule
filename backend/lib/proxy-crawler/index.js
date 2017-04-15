const log = require("../logger")

const zeroFrame = require("../zero-frame")
const url = require("../url-formatter")
const w = require("../w.js")

function siteCrawler(set, cb) {
  zeroFrame(set, (e, z) => {
    if (e) return cb(e)
    log.cycle("Crawl proxy " + set.host)
    z.cmd("siteList", {}, (e, res) => {
      if (e) return cb(e)
      const list = res.map(r => {
        return {
          peers: r.peers,
          address: r.address
        }
      })
      log.level(0, "Success")
      z.close()
      return cb(null, {
        proxy: set.host,
        list
      })
    })
  })
}
const sources = require("../../sources.json").proxies
w(sources, (proxy, next) => {
  siteCrawler(url(proxy), (e, r) => {
    console.log(e, r)
    return next(null, r)
  })
})((err, res) => {
  if (err) throw err
  require("fs").writeFileSync("./list.json", new Buffer(JSON.stringify(res)))
  console.log("Results saved as ./list.json")
  var t = {}
  res.map(proxy_list => {
    proxy_list.list.map(site => {
      if (!t[site.address]) t[site.address] = []
      t[site.address].push(site.peers)
    })
  })
  const merged = Object.keys(t).map(site => {
    var r = {
      site,
      peers_all: t[site]
    }
    r.peers = Math.floor(r.peers_all.reduce((a, b) => a + b, 0) / r.peers_all.length) //take the average (as int)
    return r
  })
  require("fs").writeFileSync("./merged.json", new Buffer(JSON.stringify(merged)))
  console.log("Merged results saved as ./merged.json")
})
