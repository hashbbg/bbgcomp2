var anew = require("../libs/anew"),
    enemies = require("./enemies"), 
    timer = require("../timer")

function gen_levels (gm){
    var levels = []

    levels.push([
        { func: function(){
            gm.spawn("peon")
        }, time: 0},
    
    ])


    return levels
}

var game_manager = anew({
    
    game: undefined,
    current_level: 0,
    running: false,
    on_add: function(){
        this.timer = anew(timer)
        this.levels = gen_levels(this)
    },
    load_level: function(num){
        this.timer.add_actions(this.levels[num])
    },

    update: function(td){
        this.timer.update(td)
        if ( !this.running ) {
            this.load_level(this.current_level)
            this.current_level += 1
        }
    },

    win: function(){
        console.log("you've won!")
    },

    spawn: function(type, pattern){
        this.game.add(anew(enemies[type]))
    }
    
})



module.exports = game_manager
