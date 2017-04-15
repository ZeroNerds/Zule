function w(l, fnc) {
  var res = []

  function run(done) {
    var i = l.shift()
    if (i) {
      fnc(i, function (e, r) {
        if (e) return done(e)
        if (r) res.push(r)
        return run(done)
      })
    } else {
      done(null, res)
    }
  }
  return run
}

function lazy() {
  const list = []

  function push(a, f) {
    list.push({
      a: a,
      f: f
    })
  }

  function exec(cb) {
    new w(list, function (i, done) {
      i.f(i.a, done)
    })(cb)
  }
  this.push = push
  this.wait = exec
  this.exec = exec
}
w.lazy = lazy
module.exports = w
