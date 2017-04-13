const parse = require("url").parse

const protoByPort = {
  "http:": 80,
  "https:": 443
}

function URLFormatter(url) {
  const u = parse(url)
  return {
    host: u.host.split(":")[0],
    protocol: u.protocol.split(":")[0],
    port: (u.port || protoByPort[u.protocol] || 43110),
    zite: u.path.split("/")[1] || "1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D"
  }
}
module.exports=URLFormatter
