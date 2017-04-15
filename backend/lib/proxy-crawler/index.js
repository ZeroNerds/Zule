const log = require("../logger")

const zeroFrame = require("../zero-frame")

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
        urlData: set,
        list
      })
    })
  })
}
module.exports = siteCrawler
