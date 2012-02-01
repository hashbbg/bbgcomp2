var asDrawable = function (action) {
  this.draw = function (context) {
    if (this.image != null) {
      context.drawImage(this.image, this.x, this.y)
    } else {
      context.fillStyle = this.baseColor;
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
}

module.exports = asDrawable
