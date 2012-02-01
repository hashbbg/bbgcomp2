function augment() {
  var proto = Array.prototype.slice.call(arguments)[0],
    mixins = Array.prototype.splice.call(arguments, 1)
  function F() {}
  var i
  for (i = mixins.length - 1; i >= 0; i--) {
    mixins[i].call(F.prototype)
  }
  proto.call(F.prototype)
  proto.prototype = F.prototype
}

module.exports = augment