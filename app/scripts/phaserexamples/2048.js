var game;

// tile width, in pixels
var tileSize = 100;

// colors to tint tiles according to their value
var colors = {
	2:0xFFFFFF,
	4:0xFFEEEE,
	8:0xFFDDDD,
	16:0xFFCCCC,
	32:0xFFBBBB,
	64:0xFFAAAA,
	128:0xFF9999,
	256:0xFF8888,
	512:0xFF7777,
	1024:0xFF6666,
	2048:0xFF5555,
	4096:0xFF4444,
	8192:0xFF3333,
	16384:0xFF2222,
	32768:0xFF1111,
	65536:0xFF0000
}


window.onload = function() {	
	game = new Phaser.Game(tileSize * 4, tileSize * 4, Phaser.AUTO, "");
     game.state.add("PlayGame",playGame);
     game.state.start("PlayGame");
}

var playGame = function(game){};

playGame.prototype = {
     preload: function(){
          // preload the only image we are using in the game
	    game.load.image("tile", "images/phaserexamples/tile.png");
     },
     create: function(){
          // SCALING AND ALIGNING THE GAME
          game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
          game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
          // game array, starts with all cells to zero
          this.fieldArray = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          // variables to handle keyboard input
          this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.upKey.onDown.add(this.handleKey, this);
    		this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    		this.downKey.onDown.add(this.handleKey, this);
    		this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    		this.leftKey.onDown.add(this.handleKey, this);
    		this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    		this.rightKey.onDown.add(this.handleKey, this);   
          // this is the group which will contain all tile sprites
		this.tileSprites = game.add.group();
          // at the beginning of the game, the player cannot move
          this.canMove=false;
          // at the beginning of the game we add two "2"
          this.addTwo();
		this.addTwo();
     },
     // A NEW "2" IS ADDED TO THE GAME
	addTwo: function(){
		// choosing an empty tile in the field
		do{
			var randomValue = Math.floor(Math.random() * 16);
		} while (this.fieldArray[randomValue] != 0)
		// such empty tile now takes "2" value
		this.fieldArray[randomValue] = 2;
		// creation of a new sprite with "tile" instance, that is "tile.png" we loaded before
		var tile = game.add.sprite(toCol(randomValue) * tileSize, toRow(randomValue) * tileSize, "tile");
		// creation of a custom property "pos" and assigning it the index of the newly added "2"
		tile.pos = randomValue;
		// at the beginning the tile is completely transparent
		tile.alpha = 0;
		// creation of a text which will represent the value of the tile
		var text = game.add.text(tileSize / 2, tileSize / 2, "2", {
               font: "bold 16px Arial",
               align: "center"
          });
          // setting text anchor in the horizontal and vertical cenater
		text.anchor.set(0.5);
		// adding the text as a child of tile sprite
		tile.addChild(text);
		// adding tile sprites to the group
		this.tileSprites.add(tile);
		// creation of a new tween for the tile sprite
		var fadeIn = game.add.tween(tile);
		// the tween will make the sprite completely opaque in 250 milliseconds
		fadeIn.to({
               alpha: 1
          }, 250, Phaser.Easing.Linear.None, true);
		// tween callback
		fadeIn.onComplete.add(function(){
			// updating tile numbers. This is not necessary the 1st time, anyway
			this.updateNumbers();
			// now I can move
			this.canMove=true;
		}, this);
	},
     handleKey: function(e){
          // Is the player allowed to move?
          if(this.canMove){
          	// the player can move, let's set "canMove" to false to prevent moving again until the move process is done
               this.canMove=false;
               // keeping track if the player moved, i.e. if it's a legal move
               var moved = false;
               // look how I can sort a group ordering it by a property
               switch(e.keyCode){
                    case Phaser.Keyboard.A:
                         this.tileSprites.sort("x", Phaser.Group.SORT_ASCENDING);
                    break;
                    case Phaser.Keyboard.D:
                         this.tileSprites.sort("x", Phaser.Group.SORT_DESCENDING);
                    break; 
                    case Phaser.Keyboard.W:
                         this.tileSprites.sort("y", Phaser.Group.SORT_ASCENDING);
                    break;
                    case Phaser.Keyboard.S:
                         this.tileSprites.sort("y", Phaser.Group.SORT_DESCENDING);
                    break;
               }    
			// looping through each element in the group
			this.tileSprites.forEach(function(item){
				// getting row and column starting from a one-dimensional array
				var row = toRow(item.pos);
				var col = toCol(item.pos);
                    switch(e.keyCode){
                         // moving LEFT
     				case Phaser.Keyboard.A:
                              // checking if we aren't already on the leftmost column (the tile can't move)
          				if(col > 0){
          					// setting a "remove" flag to false. Sometimes you have to remove tiles, when two merge into one 
          					var remove = false;
          					// looping from column position back to the leftmost column
          					for(var i = col - 1; i >= 0; i--){
          						// if we find a tile which is not empty, our search is about to end...
          						if(this.fieldArray[row * 4 + i] != 0){
          							// ...we just have to see if the tile we are landing on has the same value of the tile we are moving
          							if(this.fieldArray[row * 4 + i] == this.fieldArray[row * 4 + col]){
          								// in this case the current tile will be removed
          								remove = true;
          								i--;                                             
          							}
          							break;
          						}
          					}
          					// if we can actually move...
          					if(col != i + 1){
          						// set moved to true
                                        moved=true;
                                        // moving the tile "item" from row*4+col to row*4+i+1 and (if allowed) remove it
                                        this.moveTile(item, row * 4 + col, row * 4 + i + 1, remove);
          					}
          				}
                         break;
                         // moving RIGHT
                         case Phaser.Keyboard.D:
                              if(col < 3){
                                   var remove = false;
          					for(i = col + 1; i <= 3; i++){
          						if(this.fieldArray[row * 4 + i] !=0){
                                             if(this.fieldArray[row * 4 + i] == this.fieldArray[row * 4 + col]){
          								remove = true;
          								i++;                                             
          							}
          							break
          						}
          					}
          					if(col != i - 1){
                                        moved = true;
          						this.moveTile(item, row * 4 + col, row * 4 + i - 1, remove);
          					}
          				}
                         break;
                         // moving UP
                         case Phaser.Keyboard.W:
                              if(row > 0){  
                                   var remove=false;
     						for(i = row - 1; i >= 0; i--){
     						    if(this.fieldArray[i * 4 + col] != 0){
     							   if(this.fieldArray[i * 4 + col] == this.fieldArray[row * 4 + col]){
     							        remove = true;
     							        i--;                                             
                                             }
                                             break
     							}
     						}
     						if(row != i + 1){
                                        moved=true;
                                        this.moveTile(item, row * 4 + col, (i + 1) * 4 + col, remove);
     						}
     					}
                         break;
                         // moving DOWN
                         case Phaser.Keyboard.S:
                              if(row<3){
                                   var remove = false;
                                   for(i = row + 1; i <= 3; i++){
                                        if(this.fieldArray[i * 4 + col] !=0 ){
                                             if(this.fieldArray[i * 4 + col] == this.fieldArray[row * 4 + col]){
                                                  remove = true;
                                                  i++;                                             
                                             }
                                             break
                                        }
                                   }
                                   if(row!=i-1){
                                        moved=true;
                                        this.moveTile(item,row*4+col,(i-1)*4+col,remove);
                                   }
                              }
                         break;
                         
                    }
			}, this);
			// completing the move
			this.endMove(moved);
          }
     },
     // THIS FUNCTION UPDATES NUMBER AND COLOR IN EACH TILE
     updateNumbers: function(){
	    // look how I loop through all tiles
		this.tileSprites.forEach(function(item){
			// retrieving the proper value to show
			var value = this.fieldArray[item.pos];
			// showing the value
			item.getChildAt(0).text = value;
			// tinting the tile
			item.tint = colors[value];
		}, this);	
	},
     // FUNCTION TO COMPLETE THE MOVE AND PLACE ANOTHER "2" IF WE CAN
	endMove: function(m){
	    // if we move the tile...
		if(m){
			// add another "2"
			this.addTwo();
          }
          else{
          	// otherwise just let the player be able to move again
			this.canMove=true;
		}
	},
     // FUNCTION TO MOVE A TILE
	moveTile: function(tile, from, to, remove){
		// first, we update the array with new values
          this.fieldArray[to] = this.fieldArray[from];
          this.fieldArray[from] = 0;
          tile.pos = to;
          // then we create a tween
          var movement = game.add.tween(tile).to({
               x: tileSize * (toCol(to)),
               y: tileSize * (toRow(to))
          }, 150, Phaser.Easing.Linear.None, true);
          if(remove){
          	// if the tile has to be removed, it means the destination tile must be multiplied by 2
               this.fieldArray[to] *= 2;
               // at the end of the tween we must destroy the tile
               movement.onComplete.add(function(){
                    tile.destroy();
               });
          }
     }     
}

// GIVEN A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE ROW AS IF IT WERE IN A 4*4 TWO DIMENSIONAL ARRAY
function toRow(n){
	return Math.floor(n / 4);
}
				
// GIVEN A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE COLUMN AS IF IT WERE IN A 4*4 TWO DIMENSIONAL ARRAY
function toCol(n){
	return n % 4;	
}