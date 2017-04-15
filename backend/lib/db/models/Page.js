const PageSchema = mongoose.Schema({
  zite:String,
  ziteID:String,
  url:String, //stuff like / (with index.html ALWAYS replaced) or /folder/special.html
  contents:Object,
  url2:Array, //example Home » Post 1
  user:String //for things like posts
})

module.exports = mongoose.model('Page', PageSchema)
