//TODO: use bunyan as logger

function Logger() {
  function cycle(t) {
    console.log(" ◯ ", t)
  }

  function level(l, t) {
    let a
    switch (l) {
    case 0:
      a = "     =>"
      break;
    case 1:
      a = "        =>"
      break;
    default:
      a = "?"
    }
    console.log(a, t)
  }
  this.cycle = cycle
  this.level = level
}
module.exports = new Logger()
