(function(){
    window.onload = function() {
        var game_canvas;
        var keys;
        var ship;
        var camera;
        var ctx;
        var request_update;
        function set_event_listeners() {
            document.addEventListener('keydown', function(event) {
                    keys[event.keyCode] = true;
                    return false;
                }, false);
            document.addEventListener('keyup', function(event) {
                    keys[event.keyCode] = false;
                    return false;
                }, false);
        }
        function reset() {
            game_canvas = document.getElementById('game_canvas');
            game_canvas.width = 800;
            game_canvas.height = 450;
            keys = {};
            
            ship = {
                x: 0,
                y: 50,
                dx: 0,
                dy: 0,
                bullets: new Array(50),
                bullet_cursor: 0
            };
            for(var i = 0 ; i < ship.bullets.length ; i++) {
                ship.bullets[i] = {
                    state: 'off'
                };
            }
            camera = {
                x: 0,
                y: 0
            };
            ctx = game_canvas.getContext('2d');
            request_update = (function(){
                  return  window.requestAnimationFrame       || 
                          window.webkitRequestAnimationFrame || 
                          window.mozRequestAnimationFrame    || 
                          window.oRequestAnimationFrame      || 
                          window.msRequestAnimationFrame     || 
                          function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                          };
                })();
            set_event_listeners();
        }
        function update_player(player_data) {
            var new_x = player_data.x + player_data.dx;
            var new_y = player_data.y + player_data.dy;
            if(new_x > -game_canvas.width / 2 &&
               new_x < game_canvas.width / 2) {
                player_data.x = new_x;
            }
            if(new_y > camera.y &&
               new_y < game_canvas.height + camera.y) {
                player_data.y = new_y;
            }
            for(var i = 0 ; i < player_data.bullets.length ; i++) {
                if(player_data.bullets[i].state == 'alive') {
                    player_data.bullets[i].x += player_data.bullets[i].dx;
                    player_data.bullets[i].y += player_data.bullets[i].dy;
                }
            }
        }
        function screen_to_map(x, y) {
            return {
                x: x - game_canvas.width / 2,
                y: y
            };
        }
        function map_to_screen(x, y) {
            return {
                x: x + game_canvas.width / 2,
                y: game_canvas.height - y
            };
        }
        function fire(x, y) {
            ship.bullets[ship.bullet_cursor] = {
                x: x,
                y: y,
                dx: 0,
                dy: 5,
                state: 'alive'
            };
            ship.bullet_cursor = (ship.bullet_cursor + 1) % 50;
        }
        function update() {
            var unit = 3;
            if(keys[65]) {
                fire(ship.x, ship.y);
            }
            if(keys[37]) {
                ship.dx = -unit;
            }
            else if(keys[39]) {
                ship.dx = unit;
            }
            else {
                ship.dx = 0;
            }
            if(keys[38]) {
                ship.dy = unit;
            }
            else if(keys[40]) {
                ship.dy = -unit;
            }
            else {
                ship.dy = 0;
            }
            update_player(ship);
            ship.y += 1;
            camera.y += 1;
        }
        function draw_fire(fire) {
            if(fire.state == 'alive') {
                var coords = map_to_screen(fire.x, fire.y);
                ctx.fillRect(coords.x, coords.y, 10, 10);
            }
        }
        function draw_player(player_data) {
            var coords = map_to_screen(player_data.x, player_data.y- camera.y);
            ctx.fillStyle = 'rgb(255, 0, 0)';
            ctx.fillRect(coords.x - 20, coords.y - 20, 40, 40);
            for(var i = 0 ; i < player_data.bullets.length; i++) {
                draw_fire(player_data.bullets[i]);
            }
        }
        function draw() {
            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, game_canvas.width, game_canvas.height);
            draw_player(ship);
        }
        function loop() {
            update();
            draw();
            request_update(loop);
        }
        reset();
        request_update(loop);
    }
})();
