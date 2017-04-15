require("./init.js")

const url = require("./lib/url-formatter")
const w = require("./lib/w.js")
const siteCrawler = require("./lib/proxy-crawler")

const sources = require("./sources.json").proxies
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
      peers: {
        list: t[site]
      }
    }
    r.peers.avg = Math.floor(r.peers.list.reduce((a, b) => a + b, 0) / r.peers.list.length) //take the average (as int)
    return r
  })
  require("fs").writeFileSync("./merged.json", new Buffer(JSON.stringify(merged)))
  console.log("Merged results saved as ./merged.json")

  console.log("Uploading to db...")
  w(res, (proxy, next) => {
    Proxy.findOne({
      url: proxy.proxy
    }, (e, r) => {
      if (e) return next(e)
      if (r) {
        console.log("Update zites file_correct proxy %s...", proxy.proxy)
        r.urlData = proxy.urlData
        r.zites = proxy.list
        r.save(next)
      } else {
        console.log("Add proxy %s...", proxy.proxy)
        new Proxy({
          url: proxy.proxy,
          urlData: proxy.urlData,
          zites: proxy.list
        }).save(next)
      }
    })
  })(e => {
    if (e) throw e
    w(merged, (zite, next) => {
      Zite.findOne({
        address: zite.site
      }, (e, r) => {
        if (e) return next(e)
        if (r) {
          console.log("Update peers for zite %s...", r.address)
          r.peers.avg = zite.peers.avg
          r.peers.list = zite.peers.list
          r.save(next)
        } else {
          console.log("Add zite %s...", zite.site)
          new Zite({
            address: zite.site,
            peers: zite.peers,
            lastCrawl: 0
          }).save(next)
        }
      })
    })(e => {
      if (e) throw e;
      process.exit(0)
    })
  })
})
