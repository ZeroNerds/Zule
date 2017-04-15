const WS = require("ws")
const request = require("request")
const re = /wrapper_key = "([0-9A-Z]+)"/i

function ZeroFrame(ws) {
  let id = 0
  let cbs = {}

  function send(o) {
    ws.send(JSON.stringify(o))
  }

  function cmd(c, params, cb) {
    id++
    cbs[id] = cb
    send({
      cmd: c,
      params,
      id
    })
  }

  function response(id, res) {
    send({
      cmd: "response",
      to: id,
      result: res
    })
  }

  function safeCb(f, a) {
    if (typeof f == "function") f(a)
  }
  ws.on("message", (data /*,flags*/ ) => {
    let res = JSON.parse(data)
    switch (res.cmd) {
    case "response":
      if (typeof cbs[res.to] == "function") {
        if (res.result.error) {
          let e = new Error(res.result.error)
          e.stack += "\n\n    ----ZeroFrame Info----\n    Host: " + ws.url
          e.url = ws.url
          e.frameError = res.result.error
          cbs[res.to](e)
        } else {
          cbs[res.to](null, res.result)
        }
      } else {
        console.log("Websocket callback not found", res)
      }
      delete cbs[res.to]
      break;
    case "wrapperReady":
      cmd("innerReady", {}, () => {})
      break;
    case "ping":
      response(res.id, "pong")
      break;
    case "wrapperOpenedWebsocket":
      safeCb(this.opOpenWebsocket)
      break;
    case "wrapperClosedWebsocket":
      safeCb(this.opClosWebsocket)
      break;
    default:
      console.error("INVALID PACKET", res)
    }
    if (res.cmd == "response") {

    } else {
      console.error("INVALID RESULT", res)
    }
  })

  function close() {
    ws.close()
  }
  this.close = close
  this.cmd = cmd
}

function parseCookies(rc) {
  var list = {}

  if (rc) rc.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    if (!parts[0] || parts[0] == "path" || parts[0] == "max-age") return
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  })

  return list
}

function buildCookies(list) {
  return Object.keys(list).map(field => {
    return {
      field,
      value: list[field]
    }
  }).map(v => v.field + "=" + encodeURI(v.value)).join("; ")
}

function getString(a) {
  if (Array.isArray(a)) return a.join("");
  else return a
}

function BuildSocket(set, cb) {
  const log = require("../logger")
  log.cycle("Connect ws to " + set.host)
  log.level(0, "Connecting to " + set.host)
  request.get({
    url: set.protocol + "://" + set.host + ":" + set.port + "/" + set.zite + "/",
    headers: {
      "ACCEPT": "text/html"
    }
  }, (e, r, body) => {
    if (e) return cb(e)
    const cookies = parseCookies(getString(r.headers["set-cookie"]))
    const match = re.exec(body)
    if (!match) return cb(new Error("No wrapper_key. Is this the right server?"))
    const key = match[1]
    const ws = new WS("ws" + (set.protocol == "https" ? "s" : "") + "://" + set.host + ":" + set.port + "/Websocket?wrapper_key=" + key, {
      headers: {
        "Cookie": buildCookies(cookies)
      }
    })
    const zf = new ZeroFrame(ws)
    ws.on("open", () => {
      log.level(0, "Connected!")
      cb(null, zf)
    })
  })
}
module.exports = BuildSocket
