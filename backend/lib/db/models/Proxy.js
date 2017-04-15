const ProxySchema = mongoose.Schema({
  url: String,
  urlData: Object,
  zites: Array
})

module.exports = mongoose.model('Proxy', ProxySchema)
