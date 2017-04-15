const ZiteSchema = mongoose.Schema({
  address: String,
  lastCrawl: Date,
  crawlID: String,
  peers: {
    avg: Number,
    list: Array
  },
  tags:Array
})

module.exports = mongoose.model('Zite', ZiteSchema)
