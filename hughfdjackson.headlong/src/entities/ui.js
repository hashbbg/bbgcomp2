var anew = require("../libs/anew"),
    base = require("./base_entity")

var bar = anew(base, {

    color: "#f33",
    percent: 100,
    length: 100,
    height: 5,
    draw: function(context){
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, 
                        this.length * (this.percent / 100),
                        this.height)
    }
})


module.exports = {
    bar: bar
}
