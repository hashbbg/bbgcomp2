var anew = require("../libs/anew"),
    weapons = require("./weapons"),
    ui = require("./ui"),
    timer = require("../timer")

var player = anew({
    
    constructor: function(){
        this.vel = {
            direction: 0,
            speed: 0
        }

        this.timer = anew(timer)
    },
    game: undefined,
    x: 150,
    y: 500,
    width: 50,
    height: 60,

    speed: 0.15,

    slipperiness: 0.73,

    weapon: weapons.standard, 
    shield_strength: 1000,
    shield_max: 1000,
    health: 500,
    health_max: 500,

    on_add: function(){
        var my_ui = {
            health: anew(ui.bar, {
                color: "#f00",
                x: 20,
                y: 40
            }),
            shields: anew(ui.bar, {
                color: "#00f",
                x: 20,
                y: 20,
            })
        }
        

        this.game.add(my_ui.health)
        this.game.add(my_ui.shields)
        
        this.ui = my_ui
    },

    draw: function(context){
        if ( this.shields ) context.fillStyle = "#fff"
        else context.fillStyle = "#555"
        context.fillRect(this.x, this.y, this.width, this.height)
    },

    // --- COLLISION STUFF --- //
    check_collision: function(other){
        if ( other.type != "enemy_weapon" ) return
        
        // use shield if it's on 
        if ( this.shields && this.shield_strength > 0 ) 
            this.shield_strength -= other.power
        else if ( this.health > 0 ) 
            this.health -= other.power
        
        if ( this.health <= 0 ) console.log("game over")
        else console.log(this.health, this.shield_strength)

        // destroy bullets
        this.game.remove(other)
    },

    // --- UPDATE STUFF --- //
    update: function(td){
        
        this.timer.update(td)
        // actions
        this._firing()
        this._flying()
        this._shields(td)
        
        // display
        this._health()

        // constrain
        var canvas = this.game.canvas
        
        if ( this.x < 0 ) this.x = 0
        if ( this.x + this.width > canvas.width ) this.x = canvas.width - this.width 
        if ( this.y < 0 ) this.y = 0
        if ( this.y + this.height > canvas.height ) this.y = canvas.height - this.height
    },  

    // --- API FOR OTHER SHIPS --- //
    add_shields: function(amount){
        this.shield_strength += amount
        if ( this.shield_strength > this.shield_max ) 
            this.shield_strength = this.shield_max
    },

    // --- UPDATE HELPERS --- //
    
    _weapon_cooldown: false,

    _firing: function(){
        
        if ( (!this.game.input.fire) || this._weapon_cooldown || this.shields ) return 
    
        // create new bullet
        var bullet = anew(this.weapon)
        bullet.x = this.x + (bullet.offset.x * this.width ) - (bullet.width / 2)
        bullet.y = this.y + (bullet.offset.y * this.height ) - (bullet.height / 2)
        bullet.type = "player_weapon"
        
        bullet.from = this

        this.game.add(bullet)

        // handle cooldown
        this._weapon_cooldown = true

        this.timer.add_action(function(){
            this._weapon_cooldown = false
        }.bind(this), this.weapon.rate)
    },
    
    _flying: function(){
        var input = this.game.input,
            pi = Math.PI,
            updown_p    = input.up || input.down
            leftright_p = input.left || input.right
        
        // single button
        if ( input.up && !leftright_p ) this._set_vel(pi, this.speed)
        if ( input.down && !leftright_p ) this._set_vel(0, this.speed)
        if ( input.right && !updown_p ) this._set_vel(pi/2, this.speed)
        if ( input.left && !updown_p ) this._set_vel(pi * 1.5, this.speed)
        

        // diagonal 
        if ( input.up && input.right ) this._set_vel(pi * 0.75, this.speed)
        if ( input.up && input.left ) this._set_vel(pi * 1.25, this.speed)
    
        if ( input.down && input.left ) this._set_vel(pi * 1.75, this.speed)
        if ( input.down && input.right ) this._set_vel(pi * 0.25, this.speed)
    }, 

    _set_vel: function(direction, speed){
        this.vel.direction = direction
        this.vel.speed = speed
    },

    _shields: function(td){
        if ( this.game.input.shields ) {
            this.shields = true
            this.shield_strength -= 0.1 * td
            if ( this.shield_strength < 0 ) this.shield_strength = 0
        } else {
            this.shields = false
        }

        this.ui.shields.percent = (this.shield_strength / this.shield_max) * 100
    },

    _health: function(){
        this.ui.health.percent = (this.health / this.health_max ) * 100
    }
    

})


module.exports = player
