const mongoose = global.mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/zule");
["Zite", "Proxy", "Page"].map(m => {
  global[m] = require(__dirname + "/models/" + m)
})
