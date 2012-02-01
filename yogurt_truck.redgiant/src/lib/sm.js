var asStatusManager = function () {
  this.drawStatuses = function (statuses) {
    var that = this
    this.context.font = "14px Helvetica"
    this.context.fillStyle = "#a3ff1f"
    statuses.forEach(function(status) {
      that.context.fillText(status.text, status.x, status.y)
    })
  }
}
module.exports = asStatusManager