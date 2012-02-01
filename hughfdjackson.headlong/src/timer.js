var anew = require("./libs/anew")

var timer = anew({
    constructor: function(){
        this.actions        = []
        this.elapsed_time   = 0
    },
    update: function(td){
        var actions = this.actions
        
        this.elapsed_time += td
        var elapsed_time = this.elapsed_time

        actions.forEach(handle_delay)

        function handle_delay(d){
            if ( d.time > elapsed_time ) return
            d.func()
            actions.splice(actions.indexOf(d), 1)
        }
    },
    add_action: function(func, time){
        this.actions.push({func: func, time: this.elapsed_time + time})
        this.actions.sort(function(a, b){
            return a.time - b.time
        })
    },

    add_actions: function(array){
        if ( !array ) return
        var self = this
        array.forEach(function(object){
            self.add_action(object.func, object.time)
        })
    },

})


module.exports = timer
