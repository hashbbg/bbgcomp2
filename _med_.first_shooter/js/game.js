var physicScale = 20;

var   b2Vec2 = Box2D.Common.Math.b2Vec2
,  b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,       b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
,       b2ContactListener = Box2D.Dynamics.b2ContactListener 
,       b2Transform = Box2D.Common.Math.b2Transform
;


var MenuState = function() {  
    GameState.call(this);
  
    /*this.titleimg = new Image();
  this.titleimg.src = "img/shuttingDown.png";    */
     
    this.name= "MenuState";
    this.x = -10;
    this.y = -10;
    this.clicked = false;  
    this.score = null;
    this.buttonY = 0;
     
    this.init = function(params) {     
        if(params != null) {
            this.score = params.score;
            this.buttonY = 20;
        }                               
  
    }
    
    // custom draw method
    this.draw = function(ctx, width, height) {   
        var inpath = false;
   
        ctx.fillStyle = "rgb(0,0,80)";
        ctx.fillRect(0,0, width, height);
 
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
 
        //ctx.drawImage(this.titleimg, 100, 100);
 
        if(this.score != null) ctx.fillText("Your final score is "+this.score, width/2, height/2- 30);
     
        // if(media.isReady()) {            
        ctx.beginPath();
        ctx.arc(width - 100, height/2 +this.buttonY, 20, Math.PI/2, -Math.PI/2, true);
        ctx.lineTo(100, height/2-20+this.buttonY);
        ctx.arc(100, height/2 +this.buttonY, 20, -Math.PI/2, Math.PI/2, true);
        ctx.lineTo(width - 100, height/2+20+this.buttonY);
        ctx.closePath();
        inpath = ctx.isPointInPath(this.x, this.y)
        if(inpath) {
            ctx.fillStyle = "#5050ff";
        }
        else ctx.fillStyle = "#2020ff";
        ctx.fill();
 
        ctx.fillStyle = "#ffffff";
        if(this.score != null) ctx.fillText("Restart!", width/2, height/2+ 20);
        else ctx.fillText("Start!", width/2, height/2);
             
        if(this.clicked && inpath)
        {              
            this.toState( this.playingstate);    
        }
        this.clicked = false;  
    // }
    // else {
    //  ctx.fillText("Loading..."+media.loaded, width/2, height/2); 
    // }
    }
    
    // custom event handlers
    this.mouseClick = function(evt) {   
        this.x = evt.X;
        this.y = evt.Y;
        this.clicked = true;
    //document.getElementById('txtDebug').value = 'Click '+evt.X+','+evt.Y;
    }
  
    this.mouseMove = function(evt) {  
        this.x = evt.X;
        this.y = evt.Y;   
   
    }  
}
MenuState.prototype = new GameState(); // extend GameState


var PlayingStatus = function(menustate) {   
    this.loaded = false;
    this.menustate = menustate;
    this.player = null;
    this.enemies = {};
    this.enemiesCount = 0;
    
    this.bullets = {};
    this.bulletindex = 0;
    this.bulletCount = 0;
    
    this.bulletsToDestroy = Array();    
    this.toDestroy = {};
    
    this.bgdust = null;
    this.bg = null;
    this.medias = null;   
    this.width = 0;
    this.height = 0;
    this.spawnEnemyDelay = 0;
    
    this.currentEnemyWave = createEnemyWave();
    
    PlayingStatus.prototype.init = function(params) {        
        if(this.loaded) {
            this.restart();
            return;
        }
        this.medias = new MediaTracker();
        
        // load media
        var im = new Image();
        im.src = 'img/bgdust.gif';
        
        var playerim = new Image();
        playerim.src = 'img/player.png';
        
        var enemyim = new Image();
        enemyim.src = 'img/enemy1.png';
        
        var nearstars = new Image();
        nearstars.src = 'img/nearstars.png';
        var farstars = new Image();
        farstars.src = 'img/farstars.png';
        var bgim = new Image();
        bgim.src = 'img/nebula.jpg?v=2';
        
        var energybar = new Image();
        energybar.src = 'img/energybar.gif';
        
        var bulletp = new Image();
        bulletp.src = 'img/playerbullet.png';
        var bullete = new Image();
        bullete.src = 'img/enemybullet.png';
        
        this.medias.addMedia('bulletp',bulletp);
        this.medias.addMedia('bullete',bullete);
        
        this.medias.addMedia('dust', im);
        this.medias.addMedia('player', playerim);
        this.medias.addMedia('nearstars', nearstars);
        this.medias.addMedia('farstars', farstars);
        this.medias.addMedia('bgim', bgim);
        this.medias.addMedia('energybar', energybar);
        this.medias.addMedia('enemyim', enemyim);
        this.medias.load();
        
        this.game.context.fillStyle = '#ffffff';
        this.game.context.font = '36pt Sans-serif';
        this.game.context.textAlign = "start";
        this.game.context.textBaseline = "alphabetic";
        
        this.width = this.game.canvas.width;
        this.height = this.game.canvas.height;
        
        var PS = this;
        this.medias.onload = function() {
            
            Bullet.prototype.ebullet = bullete;
            Bullet.prototype.pbullet = bulletp;
            
            PS.setUpPhysics();
            var foreLayer = new GameLayer(3);
            var bgLayer = new GameLayer(1);
            
            /*** background ***/
            // nebula
            PS.bg = new TilingImage(bgim, 640, 480, 0, 0.005);            
            bgLayer.addGameObject(PS.bg);
                        
            bgLayer.addGameObject(new TilingImage(farstars, 640, 480, 0, 0.009));
            //bgLayer.addGameObject(new TilingImage(nearstars, 640, 480, 0, 0.01));
            
            // dust
            PS.bgdust = new TilingImage(im, 640, 480, 0, 0.04);
            bgLayer.addGameObject(PS.bgdust);
        
        
            /*** foreground ***/     
            
            
            PS.player = new Player(PS.game.canvas.width, PS.game.canvas.height, playerim);
            PS.player.createPhysicBody(PS.world);
            foreLayer.addGameObject(PS.player);
            
            /*var randid = 'e'+Math.random()+(new Date()).getTime();
            PS.enemies[randid] = new EnemyShip1(randid, enemyim);
            PS.enemies[randid].createPhysicBody(PS.world);
            foreLayer.addGameObject(PS.enemies[randid]);*/
        
            // UI
            //  playerstats
            PS.playerStats = new PlayerStats(energybar);
            foreLayer.addGameObject(PS.playerStats);
        
            PS.addLayer(bgLayer);
            PS.addLayer(foreLayer);
            
            PS.foreLayer = foreLayer;     
            PS.loaded = true;
        }        
    }       
    
    PlayingStatus.prototype.setUpPhysics = function() {         
        this.world = new b2World(
            new b2Vec2(0, 0)    //gravity
            ,  true                 //allow sleep
            );
                
        var PS = this;
        
        var contactListener = new Box2D.Dynamics.b2ContactListener;
        contactListener.BeginContact = function(contact) {
            PS.beginContact(contact);
        };
        
        this.world.SetContactListener( contactListener );
    }
    
    PlayingStatus.prototype.restart = function() {      
        this.world.Step(60/1000, 10, 10);
        this.world.ClearForces();
        
        this.game.context.fillStyle = '#ffffff';
        this.game.context.font = '36pt Sans-serif';
        this.game.context.textAlign = "start";
        this.game.context.textBaseline = "alphabetic";
        
        this.player.LEFT(false);                
        this.player.UP(false);                
        this.player.RIGHT(false);                
        this.player.DOWN(false);                
        this.player.fireButton(false);
        this.player.setInitialPos();                
        this.playerStats.life = 10;
        this.playerStats.score = 0;
        this.enemies = {};
        this.enemiesCount = 0;
    
        this.bullets = {};
        this.bulletindex = 0;
        this.bulletCount = 0;
    
        this.bulletsToDestroy = Array();    
        this.toDestroy = {};
               
        this.spawnEnemyDelay = 0;
        this.player.setInitialPos(); 
        this.world.Step(1000/1000, 10, 10);
        this.world.ClearForces();
        this.player.setInitialPos(); 
        
        
    }
    
    PlayingStatus.prototype.addEntity = function(entity) {
        
    }
    
    PlayingStatus.prototype.removeEntity = function(entity) {
        var eid = entity.id;
        //alert(entity.body+' '+this.world.IsLocked());
        //this.world.DestroyBody(entity.body);
        //this.foreLayer.removeGameObject(entity);
        //alert('removing '+eid);
        this.toDestroy[eid] = entity;
    //delete this.enemies[eid];
    }
    
    PlayingStatus.prototype.beginContact = function(contact) {
        var eA = contact.GetFixtureA().GetUserData().entity;
        var eB = contact.GetFixtureB().GetUserData().entity;
    
        //alert('contact between '+fixA.entity.name+' and '+fixB.entity.name);
    
        if( (eA.type == 'playerbullet' || eB.type == 'playerbullet') &&
            (eA.type == 'enemy' || eB.type == 'enemy') ) {
            
            //this.playerStats.life--;
            //if(this.playerStats.life < 0) this.playerStats.life = 0;
            
            var enemyEntity = null;
            if(eA.type == 'playerbullet') {
                delete this.bullets[eA.id];
                this.removeEntity(eA);
                enemyEntity = eB;
            }
            else if(eB.type == 'playerbullet') {
                delete this.bullets[eB.id];            
                this.removeEntity(eB);
                enemyEntity = eA;
            }
            
            enemyEntity.energy--;
            if(enemyEntity.energy <= 0) {
                this.removeEntity(enemyEntity);  
                this.playerStats.score++;
            }
            
           
        }
        else if( (eA.type == 'enemybullet' || eB.type == 'enemybullet') &&
            (eA.type == 'player' || eB.type == 'player') ) {
        
            if(eA.type == 'enemybullet') {                                
                delete this.bullets[eA.id];
                this.removeEntity(eA);    
            }
            else if(eB.type == 'enemybullet') {
                delete this.bullets[eB.id];
                this.removeEntity(eB);
            }
            
            this.playerStats.life--;
        }
        
    }
    
    
    
    PlayingStatus.prototype.keyDown = function(evt) {
        switch(evt.keyCode) {
            case 37:
                this.player.LEFT(true);
                break;
            case 38:
                this.player.UP(true);
                break;
            case 39:
                this.player.RIGHT(true);
                break;
            case 40:
                this.player.DOWN(true);
                break;
            case 67:    // Pressed 'C': shoot
                this.player.fireButton(true);
                break;
        }        
    }
    
    PlayingStatus.prototype.keyUp = function(evt) {
        switch(evt.keyCode) {
            case 37:
                this.player.LEFT(false);
                break;
            case 38:
                this.player.UP(false);
                break;
            case 39:
                this.player.RIGHT(false);
                break;
            case 40:
                this.player.DOWN(false);
                break;
            case 67:    // Released 'C': shoot
                this.player.fireButton(false);
                break;
        }
    }  
    
    /*PlayingStatus.prototype.draw = function(ctx, width, height, delta) {
        GameState.prototype.draw.call(this, ctx, width, height, delta);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText('enemies: '+this.bulletCount, 10, 450);
    }*/
    
    PlayingStatus.prototype.update = function(delta) {   
        if(!this.playerStats || this.playerStats.life <= 0) return;
        /*this.spawnEnemyDelay -= delta;
        if(this.spawnEnemyDelay <= 0 && this.enemiesCount < 30 ) {
            this.spawnEnemy();
            this.spawnEnemyDelay = 1000;
        }*/
                
        this.spawnEnemy(delta);
        
        if(this.player) this.firing();       
        
        this.enemiesShooting();
        
        if(this.world) {
            this.world.Step(delta/1000, 10, 10);
            this.world.ClearForces();
        }
        
        for(var x in this.toDestroy) {
            
            var e = this.toDestroy[x];
            var eid = e.id;
            
            // alert('deleting '+x+': '+eid);
            
            if(e.type == 'enemy') {
                //this.playerStats.score++;            
                delete this.enemies[eid];
                this.enemiesCount--;
            }
            else if(e.type == 'playerbullet' || e.type == 'enemybullet') 
                this.bulletCount--;
            // delete this.bullets[eid];
            
                       
            this.world.DestroyBody(e.body);
            
           
            this.foreLayer.removeGameObject(e);            
            //delete this.enemies[eid];            
            
            e.body = null;            
            delete this.toDestroy[eid];
            
        }
        //this.toDestroy = {};
        
        GameState.prototype.update.call(this, delta);                
        
        for(var x in this.bullets) {            
            if(this.bullets[x].y < -2 || this.bullets[x].y > this.height+2 ||
                this.bullets[x].x < -2 || this.bullets[x].x > this.width +2) {
                //alert('todelete '+this.bullets[x].id);
                this.toDestroy[x] = this.bullets[x];
                delete this.bullets[x];               
            }
        }
        
        for(var x in this.enemies) {
            if(this.enemies[x].isPathEnd())
                this.removeEntity(this.enemies[x]);
        }
        
        if(this.playerStats.life <=0)
            this.toState(this.menustate,  {
                score: this.playerStats.score
            });
         
    }
        
    PlayingStatus.prototype.spawnEnemy = function(delta) {
        //return;
        if(!this.world) return;        
        
        var enArray = this.currentEnemyWave.spawn(delta);
        
        if(enArray != null) {
            for(var i=0; i< enArray.length; i++) {
                var randid = 'e'+Math.floor(Math.random()*100000)+(new Date()).getTime();
                this.enemies[randid] = new EnemyShip1(randid, this.medias.getMedia('enemyim'));
                this.enemies[randid].path = enArray[i].path;
                this.enemies[randid].createPhysicBody(this.world);
                this.foreLayer.addGameObject(this.enemies[randid]);     
                this.enemiesCount++;
            }
        }  
        
        if(this.currentEnemyWave.isEnded())
            this.currentEnemyWave = createEnemyWave();
    }
    
    PlayingStatus.prototype.enemiesShooting = function() {
        if(!this.world) return;
        
        for(var e in this.enemies) {
            var enemy = this.enemies[e];
            
            var shootarray = enemy.shoot(this.player);
            if(shootarray != null){
                /*var v = new b2Vec2(this.player.x - enemy.x, this.player.y - enemy.y);
                v.Normalize();
                v.Multiply(5);*/
                for(var i=0; i<shootarray.length; i++)
                    this.createBullet( 'enemybullet', enemy.x, enemy.y, true, shootarray[i].vec );
            }
        }
    }
        
    PlayingStatus.prototype.firing = function() {
        if(this.player.shoot()) {   // create bullets
            this.createBullet( 'playerbullet' , this.player.x - 6, this.player.y - 20);
            this.createBullet( 'playerbullet' , this.player.x + 6, this.player.y - 20);
        }
    }          
    
    PlayingStatus.prototype.createBullet = function(type, x, y, enemybullet, vec) {  
        if(enemybullet == undefined) enemybullet = false;
        var bullet = new Bullet('b'+this.bulletindex, type, x, y, enemybullet);
        bullet.createPhysicBody(this.world, vec);
        this.bullets['b'+this.bulletindex] = bullet;
        
        this.foreLayer.addGameObject(bullet);
        
        this.bulletindex = this.bulletindex+1 % Number.MAX_VALUE;   
        
        this.bulletCount++;
    }
    
    PlayingStatus.prototype.close = function() {
        for(var x in this.bullets) {            
            this.foreLayer.removeGameObject(this.bullets[x]);
            this.world.DestroyBody(this.bullets[x].body);
            delete this.bullets[x];             
        }
        
        for(var x in this.enemies) {
            this.foreLayer.removeGameObject(this.enemies[x]);
            this.world.DestroyBody(this.enemies[x].body);
            delete this.enemies[x];            
        }
    }
}
PlayingStatus.prototype = new GameState();

var Player = function(maxw, maxh, img) {
    this.id = 'player';
    this.name = 'Player';
    this.type = 'player';
    this.body = null;
    this.img = img;
    this.x = 320;
    this.y = 420;
    this.maxw = maxw;
    this.maxh = maxh;
    
    this.w = img.width / 3;
    this.h = img.height;
    
    this.verticalMov = 0;       // -1: moving up, 1: moving down
    this.horizontalMov = 0;     // -1: moving left, 1: moving right
    this.movSpeed = 0.2;
    
    this.shooting = false;
    this.shootingDelay = 0;
    
    Player.prototype.fireButton = function(shooting) {
        this.shooting = shooting;
    }
    
    Player.prototype.createPhysicBody = function(world) {
        var bodyDef = new b2BodyDef;
        var fixDef = new b2FixtureDef;
        bodyDef.type = b2Body.b2_dynamicBody;        
        bodyDef.linearDamping = 8.0;
        
        fixDef.shape = new b2CircleShape(0.9);        
        fixDef.restitution = 0.0;         
        fixDef.filter.groupIndex = -1;
        fixDef.filter.categoryBits = 0x0002;
        fixDef.filter.categoryMask = 0x0004;
        
        
        bodyDef.position.Set(this.x / physicScale, this.y / physicScale  );
        //world.CreateBody(bodyDef);
        // var bbody = world.CreateBody(bodyDef);
        //bbody.CreateFixture(fixDef); 
        //bbody.CreateFixture(fixSensDef).SetUserData({name:"goal"}); 
         
        this.body = world.CreateBody(bodyDef);
        var that = this;
        this.body.CreateFixture(fixDef).SetUserData({
            entity: that
        });
        
        this.body.SetPosition(new b2Vec2(16,22));
    }
    
    Player.prototype.setInitialPos = function() {  
        this.verticalMov = 0;      
        this.horizontalMov = 0; 
        this.body.SetPosition(new b2Vec2(16,22));        
    }
    
    Player.prototype.UP = function(pressed) {
        if(pressed && this.verticalMov != -1) this.verticalMov = -1;
        else if(!pressed && this.verticalMov == -1) this.verticalMov = 0;                
    }
    Player.prototype.DOWN = function(pressed) {
        if(pressed && this.verticalMov != 1) this.verticalMov = 1;
        else if(!pressed && this.verticalMov == 1) this.verticalMov = 0;
    }
    Player.prototype.LEFT = function(pressed) {
        if(pressed && this.horizontalMov != -1) this.horizontalMov = -1;
        else if(!pressed && this.horizontalMov == -1) this.horizontalMov = 0;
    }
    Player.prototype.RIGHT = function(pressed) {
        if(pressed && this.horizontalMov != 1) this.horizontalMov = 1;
        else if(!pressed && this.horizontalMov == 1) this.horizontalMov = 0;
    }
    
    
    Player.prototype.shoot = function() {
        if(this.shooting && this.shootingDelay <= 0) {
            this.shootingDelay = 120;
            return true;
        }
        return false;
    }        
    
    Player.prototype.update = function(delta) {
        this.shootingDelay -= delta;
        if(this.shootingDelay < 0) this.shootingDelay = 0;
        
        /* this.x += this.horizontalMov*this.movSpeed*delta;
        if(this.x > this.maxw - this.w/2) this.x = this.maxw - this.w/2;
        if(this.x <  this.w/2) this.x = this.w/2;
        
        this.y += this.verticalMov*this.movSpeed*delta;
        if(this.y > this.maxh - this.h/2) this.y = this.maxh - this.h/2;
        if(this.y < this.h/2) this.y = this.h/2;*/
        //var bpos = this.body.GetPosition();       
        
        if(this.horizontalMov != 0 || this.verticalMov != 0)
            this.body.ApplyForce( new b2Vec2(this.horizontalMov*100, this.verticalMov*100), this.body.GetPosition() );
    }
    
    Player.prototype.draw = function(ctx, width, height, delta) {        
        var bpos = this.body.GetPosition();
        this.x = bpos.x * physicScale;
        this.y = bpos.y * physicScale;
        var limit = false;
        if(this.x > this.maxw - this.w/2) {
            this.x = this.maxw - this.w/2;
            limit = true;
        }
        if(this.x <  this.w/2) {
            this.x = this.w/2;
            limit = true;
        }
        if(this.y > this.maxh - this.h/2) {
            this.y = this.maxh - this.h/2;
            limit = true;
        }
        if(this.y < this.h/2) {
            this.y = this.h/2;
            limit = true;
        }
        
        if(limit) this.body.SetPosition( new b2Vec2(this.x/physicScale, this.y / physicScale) );
        
        ctx.drawImage(this.img,
            this.w + this.horizontalMov * this.w, 0, this.w, this.h, 
            this.x - this.w/2, this.y - this.h/2, this.w, this.h);        
    }
}
Player.prototype = new GameObject();

var PlayerStats = function(img) {
    this.img = img;
    this.life = 10;
    this.x = 0;
    this.y = 0;
    this.score = 0;
    
    PlayerStats.prototype.draw = function(ctx, width, height, delta) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16pt Sans-serif';
        ctx.textAlign = 'left';
        
        ctx.fillText('Energy:', 10, 5);
        if(this.life > 0) ctx.drawImage(this.img, 0, 0, 17*this.life, 30, 100, 0, 17*this.life, 30);       
        ctx.fillText('Score: '+this.score, width-180, 5);
    }
}
PlayerStats.prototype = new GameObject();

var EnemyShip1 = function(id, img) {
    this.id = id;
    this.type = 'enemy';
    this.name = 'Red Disc';
    this.body = null;
    this.img = img;
    this.x = -20;
    this.y = -20;
    this.energy = 2;
    //this.maxw = maxw;
    //this.maxh = maxh;
    
    this.w = img.width;
    this.h = img.height;
    
    this.verticalMov = 0;       // -1: moving up, 1: moving down
    this.horizontalMov = 0;     // -1: moving left, 1: moving right
    this.movSpeed = 0.2;
    
    this.shootingDelay = 2000;
    this.shootingTimer = 2000 + Math.random()*500;
    
    this.path = [{
        x: -5, 
        y: -5
    },

    {
        x: 5, 
        y: 3
    },

    {
        x: 7, 
        y: 18
    },

    {
        x: 25, 
        y: 6
    },                 

    {
        x: 37, 
        y: -5
    }
    ];
    this.pathStep = 0;
    
    EnemyShip1.prototype.createPhysicBody = function(world) {
        var bodyDef = new b2BodyDef;
        var fixDef = new b2FixtureDef;
        bodyDef.type = b2Body.b2_dynamicBody;        
        bodyDef.linearDamping = 8.0;
        
        fixDef.shape = new b2CircleShape(0.9);        
        fixDef.restitution = 0.0;  
        fixDef.filter.groupIndex = -1;
        fixDef.filter.categoryBits = 0x0004;
        fixDef.filter.maskBits = 0x0002;
        
        bodyDef.position.Set(this.x / physicScale, this.y/physicScale );
        //world.CreateBody(bodyDef);
        // var bbody = world.CreateBody(bodyDef);
        //bbody.CreateFixture(fixDef); 
        //bbody.CreateFixture(fixSensDef).SetUserData({name:"goal"}); 
         
        this.body = world.CreateBody(bodyDef);
        var that = this;
        var fixture = this.body.CreateFixture(fixDef);
        fixture.SetUserData({
            entity: that
        });
        
        
        this.body.SetPosition(new b2Vec2(this.x / physicScale, this.y/physicScale));
    }
    
    EnemyShip1.prototype.shoot = function(player) {        
        if(this.shootingTimer <=0) {            
            var bullets = Array();
            var v = new b2Vec2(player.x - this.x, player.y - this.y);
            v.Normalize();
            v.Multiply(7);
            
            bullets.push( {
                power: 1, 
                vec: v
            } );
            
            this.shootingTimer = this.shootingDelay+Math.random()*500;
            return bullets;
        }
        
        return null;
    }
    
    EnemyShip1.prototype.update = function(delta) {
        if(this.body == null) return;
        
        this.shootingTimer -= delta;
        
        var bpos = this.body.GetPosition();
        
        var target = this.path[this.pathStep];
        
        var dx = target.x - bpos.x;
        var dy = target.y - bpos.y;
        var dist = Math.sqrt(dx*dx+dy*dy);
        
        if( dist  < 0.3 ) {   // checkpoint reached
            this.pathStep = this.pathStep+1;
            
            if(this.pathStep == this.path.length) return;
            
            target = this.path[this.pathStep];
            
            dx = target.x - bpos.x;
            dy = target.y - bpos.y;
            dist = Math.sqrt(dx*dx+dy*dy);
        }
        
        var force = new b2Vec2( dx/dist *70, dy/dist*70 );
        this.body.ApplyForce(force, bpos);
    }
    
    EnemyShip1.prototype.isPathEnd = function() {
        if(this.pathStep == this.path.length) return true; 
        return false;
    }
    
    EnemyShip1.prototype.draw = function(ctx, width, height, delta) {        
        var bpos = this.body.GetPosition();
        this.x = bpos.x * physicScale;
        this.y = bpos.y * physicScale;
                
        ctx.drawImage(this.img, this.x - this.w/2, this.y - this.h/2);        
    }
}
EnemyShip1.prototype = new GameObject();


var Bullet = function(id, type, x, y, enemybullet) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.body = null;
    this.enemybullet = enemybullet;
    
    Bullet.prototype.createPhysicBody = function(world, vec) {
        var bodyDef = new b2BodyDef;
        var fixDef = new b2FixtureDef;
        bodyDef.type = b2Body.b2_dynamicBody;        
              
        fixDef.shape = new b2CircleShape(0.1);        
        fixDef.restitution = 0.0;       
        fixDef.isSensor = true;
        
        if(enemybullet) {
            fixDef.filter.categoryBits = 0x0004;
            fixDef.filter.maskBits = 0x0002;
        }
        else {
            fixDef.filter.categoryBits = 0x0002;
            fixDef.filter.maskBits = 0x0004;
        }
        
        bodyDef.position.Set(x / physicScale, y / physicScale  );        
         
        this.body = world.CreateBody(bodyDef);        
        var that = this;
        this.body.CreateFixture(fixDef).SetUserData({
            entity: that
        });
        
        this.body.ResetMassData();
        
        this.body.SetPosition(new b2Vec2(x / physicScale, y / physicScale));
        if(vec == undefined) this.body.ApplyImpulse( new b2Vec2(0, -20), this.body.GetPosition() );
        else this.body.ApplyImpulse( vec, this.body.GetPosition() );
    }
    
    Bullet.prototype.update = function(delta) {
        var bp = this.body.GetPosition();
        
        this.x = bp.x * physicScale;
        this.y = bp.y * physicScale;
    }
    
    Bullet.prototype.draw = function(ctx, width, height, delta) {        
        if(this.enemybullet) {
            //ctx.fillStyle = '#ff0000';
            //ctx.fillRect(this.x-4, this.y-4, 8, 8);
            ctx.drawImage(this.ebullet, this.x-4, this.y-4, 8, 8 );
        }
        else {
            //ctx.fillStyle = '#ddeeff';
            //ctx.fillRect(this.x-2, this.y-2, 4, 4);
            
            ctx.drawImage(this.pbullet, this.x-4, this.y-4, 8, 16 );
            
        }
        
    }
}
Bullet.prototype = new GameObject();


var EnemyWave = function() {
    this.path = [{
        x: -5, 
        y: -5
    },

    {
        x: 5, 
        y: 3
    },

    {
        x: 7, 
        y: 18
    },

    {
        x: 25, 
        y: 6
    },                 

    {
        x: 37, 
        y: -5
    }
    ];
    
    this.nships = 6;
    this.spawnDelay = 700;
    this.time = 0;
    
    EnemyWave.prototype.spawn = function(delta) {
        this.time += delta;
        if( this.time >= this.spawnDelay && this.nships > 0) {
            var enArray = Array();
            
            enArray.push( {
                type: 'enemy_1', 
                path: this.path
            } );
            this.time = 0;
            this.nships--;
            return enArray;
        }
        return null;
    }
    
    EnemyWave.prototype.isEnded = function() {
        return (this.nships <= 0);
    }
}


function createEnemyWave() {
    var path1 = [{
        x: -5, 
        y: -5
    },

    {
        x: 5, 
        y: 3
    },

    {
        x: 7, 
        y: 18
    },

    {
        x: 25, 
        y: 6
    },                 

    {
        x: 37, 
        y: -5
    }
    ];
    
    
    var path2 = [{
        x: 37, 
        y: -5
    },

    {
        x: 27, 
        y: 3
    },

    {
        x: 25, 
        y: 18
    },

    {
        x: 7, 
        y: 6
    },                 

    {
        x: -5, 
        y: -5
    }
    ];
    
    var ew = new EnemyWave();
    
    var r = Math.random();
    
    if(r < 0.5)
        ew.path = path1;
    else
        ew.path = path2;
    
    return ew;
}