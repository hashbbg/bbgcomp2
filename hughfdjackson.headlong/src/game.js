var entity_md = require("./libs/entity_md"),
    anew = require("./libs/anew"),
    clash = require("./libs/clash")

var game = anew(entity_md, {

    // --- ATTRS --- //
    last_timestamp: 0,

    // --- METHODS --- // 
    
    constructor: function(){
        this.delays = []
    },

    //  API  //
    add: function(object){
        entity_md.add.apply(this, arguments)
        object.game = this
        if ( object.on_add ) object.on_add()
    },
    
    //  GAME LOOP  //


    check_entity_collision: function(){
        var entities = this._entities

        entities.forEach(check_against_all)
        
        function check_against_all(entity){
            if ( !entity.check_collision ) return 

            entities.forEach(function(e){
                if ( clash.aabb_aabb(entity, e)) entity.check_collision(e)
            })
        }
    },

    update_entities: function(time_delta){
        this._entities.forEach(function(e){
            if ( e.update ) e.update(time_delta)
        })
    },
    

    draw_entities: function(){
        var context = this.context,
            canvas = context.canvas,
            images = this.images

        context.clearRect(0, 0, canvas.width, canvas.height)

        this._entities.forEach(function(e){
            if ( e.image ) context.drawImage(images[e.image], ~~e.x, ~~e.y, ~~e.width, ~~e.height)
            if ( e.draw ) e.draw(context)
        })
    },

    move_entities: function(time_delta){
        
        this._entities.forEach(move_entity)
        
        function move_entity(entity){
            
            if ( !entity.vel ) return
            if ( entity.apply_physics == false ) return 
            
            if ( !entity.momentum ) 
                entity.momentum = { x: 0, y: 0 }
    
            var old_x = entity.x,
                old_y = entity.y
 
            // apply momentum
            entity.x += entity.momentum.x * time_delta
            entity.y += entity.momentum.y * time_delta

            // apply vel
            entity.x += time_delta * Math.sin(entity.vel.direction) * entity.vel.speed
            entity.y += time_delta * Math.cos(entity.vel.direction) * entity.vel.speed
            
            // store momentum
            if ( entity.slipperiness ){
                entity.momentum.x = ((entity.x - old_x) * entity.slipperiness)
                                    / time_delta
                entity.momentum.y = ((entity.y - old_y) * entity.slipperiness)
                                    / time_delta 
            }
            
            // wipe vel
            entity.vel.speed = 0
        }
    }
})

module.exports = game
