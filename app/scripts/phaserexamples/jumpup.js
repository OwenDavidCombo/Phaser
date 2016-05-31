
    var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

    var PhaserGame = function () {

        this.player = null;
        this.platforms = null;
        this.sky = null;
        this.scoreText = null;

        this.facing = 'left';
        this.edgeTimer = 0;
        this.jumpTimer = 0;
        this.time=null;
        
        this.wasStanding = false;
        this.cursors = null;
        this.score=0;
       
    };

    PhaserGame.prototype = {

        init: function () {

            this.game.renderer.renderSession.roundPixels = true;

            this.world.resize(640, 2000);

            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.physics.arcade.gravity.y = 0;
            
            this.physics.arcade.skipQuadTree = false;

        },

        

        preload: function () {



            this.load.image('trees', 'images/phaserexamples/trees.png');
            this.load.image('clouds', 'images/phaserexamples/clouds.png');
            this.load.image('platform', 'images/phaserexamples/platform (2).png');
            this.load.image('ice-platform', 'images/phaserexamples/ice-platform.png');
            this.load.spritesheet('dude', 'images/phaserexamples/dude.png', 32, 48);


        },

        create: function () {

            this.stage.backgroundColor = '#2f9acc';

            this.sky = this.add.tileSprite(0, 0, 640, 480, 'clouds');
            this.sky.fixedToCamera = true;

            this.add.sprite(0, 1906, 'trees');

            this.platforms = this.add.physicsGroup();
           
            this.addPlatforms(this);
            this.timer = game.time.events.loop(19000, this.addPlatforms, this);         
            
            

            this.platforms.setAll('body.allowGravity', false);
            this.platforms.setAll('body.immovable', true);
            this.platforms.setAll.checkWorldBounds = true;
            this.platforms.setAll.outOfBoundsKill = true;

            this.player = this.add.sprite(100, 1652, 'dude');

            this.physics.arcade.enable(this.player);

            this.player.body.collideWorldBounds = true;
            this.player.body.setSize(20, 32, 5, 16);
           this.player.body.gravity.y =750;
            
            this.player.animations.add('left', [0, 1, 2, 3], 10, true);
            this.player.animations.add('turn', [4], 20, true);
            this.player.animations.add('right', [5, 6, 7, 8], 10, true);

            this.camera.follow(this.player);

            this.cursors = this.input.keyboard.createCursorKeys();
            this.score=0;
            this.scoreText = this.add.text(16, game.world.height-49, 'score:' +this.score, { fontSize: '32px', fill: '#000' });
            this.scoretimer = game.time.events.loop(10, this.Score, this); 
        },

        wrapPlatform: function (platform) {

            if (platform.body.velocity.x < 0 && platform.x <= -160)
            {
                platform.x = 640;
            }
            else if (platform.body.velocity.x > 0 && platform.x >= 640)
            {
                platform.x = -160;
            }
            else if (platform.y<0){
                
            }
    
        },
        
        Score: function(score,scoreText){
           this.score += 10;
           
            this.scoreText.text = 'Score: ' + this.score;
            
        },
        
        setFriction: function (player, platform) {

            if (platform.key === 'ice-platform')
            {
                player.body.x -= platform.body.x - platform.body.prev.x;
            }

        },

        addPlatforms: function(x, y) {
            var x = 0;
            var y = 0;

            for (var i = 0; i < 20; i++)
            {
                 //  Inverse it?
                if (Math.random() > 0.5)
                {
                   var type='platform';
                   
                }else{type='ice-platform';}
                

                var platform = this.platforms.create(x, y, type);

               platform.body.velocity.x = 0;
                platform.body.velocity.y = 100;
               platform.body.immovable=true;
     
                //  Inverse it?
                if (Math.random() > 0.5)
                {
                    platform.body.velocity.x *= -1;
                   
                }

                 x +=  200;
                if (x >= 600)
                {
                    x =  50;
                }

                y+= 104;
            }
        },
        
        
        update: function () {

            if (this.player.y > game.world.height-49)
                game.state.start('Game'); 
            
            this.sky.tilePosition.y = -(this.camera.y * 0.7);

            this.platforms.forEach(this.wrapPlatform, this);
            
            if (this.player.body.velocity.x < 0 && this.player.x <= 10)
            {
                this.player.x = 640;
            }
            else if (this.player.body.velocity.x > 0 && this.player.x >= 600)
            {
                this.player.x = -130;
            }
            
            this.physics.arcade.collide(this.player, this.platforms, this.setFriction, null, this);

            //  Do this AFTER the collide check, or we won't have blocked/touching set
            var standing = this.player.body.blocked.down || this.player.body.touching.down;

            this.player.body.velocity.x = 0;
            
            
            
            if (this.cursors.left.isDown)
            {
                this.player.body.velocity.x = -200;

                if (this.facing !== 'left')
                {
                    this.player.play('left');
                    this.facing = 'left';
                }
            }
            else if (this.cursors.right.isDown)
            {
                this.player.body.velocity.x = 200;

                if (this.facing !== 'right')
                {
                    this.player.play('right');
                    this.facing = 'right';
                }
            }
            else
            {
                if (this.facing !== 'idle')
                {
                    this.player.animations.stop();

                    if (this.facing === 'left')
                    {
                        this.player.frame = 0;
                    }
                    else
                    {
                        this.player.frame = 5;
                    }

                    this.facing = 'idle';
                }
            }

            //  No longer standing on the edge, but were
            //  Give them a 250ms grace period to jump after falling
            if (!standing && this.wasStanding)
            {
                this.edgeTimer = this.time.time + 250;
            }

            //  Allowed to jump?
            if ((standing || this.time.time <= this.edgeTimer) && this.cursors.up.isDown && this.time.time > this.jumpTimer)
            {
                this.player.body.velocity.y = -500;
                this.jumpTimer = this.time.time + 750;
            }

            this.wasStanding = standing;

        }

    };

    game.state.add('Game', PhaserGame, true);
