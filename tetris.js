const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const EMPTY = "WHITE"; // color of an empty square
const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;


// helper function to draw a square on the board with a 
// black stroke color/style and given fill color at a given x and y
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
    //ctx.fillRect(x, y, width, height)
    //The fillRect() method draws a filled rectangle whose 
    //starting point is at (x, y) and whose size is specified
    // by width and height. 

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// create the 20x10 array of 20 10-item arrays (all empty values) to represent the initial board
let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = EMPTY;
    }
}

// draw the board using drawSquare helper function
function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [I,"green"],
    [J,"red"],
    [O,"cyan"],
    [T,"blue"],
    [L,"yellow"],
    [Z,"orange"],
    [S,"purple"]
];


class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        
        this.tetrominoN = 0;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        
        this.x = 3;
        this.y = -2;
    }
    // fn to fill in a piece
    fill(color) {
        for( r = 0; r < this.activeTetromino.length; r++){
            for(c = 0; c < this.activeTetromino.length; c++){
                // we draw only occupied squares
                if( this.activeTetromino[r][c]){
                    drawSquare(this.x + c,this.y + r, color);
                }
            }
        }
    }
    // actually fill in a piece based on its color
    draw() {
        this.fill(this.color);
    }

    //fill in a piece white
    unDraw() {
        this.fill(EMPTY);
    }
    // collision detection
    collision(x,y,piece){
        for( r = 0; r < piece.length; r++){
            for(c = 0; c < piece.length; c++){
                // if the square is empty, we skip it
                if(!piece[r][c]){
                    continue;
                }
                // coordinates of the piece after movement
                let newX = this.x + c + x;
                let newY = this.y + r + y;
                
                // conditions
                if(newX < 0 || newX >= COL || newY >= ROW){
                    return true;
                }
                // skip newY < 0; board[-1] will crush our game
                if(newY < 0){
                    continue;
                }
                // check if there is a locked piece alrady in place
                if( board[newY][newX] != EMPTY){
                    return true;
                }
            }
        }
        return false;
    }
    // move piece left
    moveLeft(){
        if(!this.collision(-1,0,this.activeTetromino)){
            this.unDraw();
            this.x--;
            this.draw();
        }
    }
    
    // move piece right
    moveRight() {
        if(!this.collision(1,0,this.activeTetromino)){
            this.unDraw();
            this.x++;
            this.draw();
        }
    }

    // move piece down
    moveDown(){
        if(!this.collision(0,1,this.activeTetromino)){
            this.unDraw();
            this.y++;
            this.draw();
        }else{
            // we lock the piece and generate a new one
            this.lock();
            p = randomPiece();
        }    
    }

    // rotate the piece
    rotate(){
        let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
        let kick = 0;
        
        if(this.collision(0,0,nextPattern)){
            if(this.x > COL/2){
                // it's the right wall
                kick = -1; // we need to move the piece to the left
            }else{
                // it's the left wall
                kick = 1; // we need to move the piece to the right
            }
        }
        
        if(!this.collision(kick,0,nextPattern)){
            this.unDraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    }
    lock() {
        for( r = 0; r < this.activeTetromino.length; r++){
            for(c = 0; c < this.activeTetromino.length; c++){
                // we skip the empty squares
                if( !this.activeTetromino[r][c]){
                    continue;
                }
                // pieces to lock on top = game over
                if(this.y + r < 0){
                    alert("Game Over");
                    // stop request animation frame
                    gameOver = true;
                    break;
                }
                // we lock the piece
                board[this.y+r][this.x+c] = this.color;
            }
        }
        // remove full rows
        for(r = 0; r < ROW; r++){
            //for each row, traverse columns and if none are empty, isRowFull stays true
            let isRowFull = true;
            for( c = 0; c < COL; c++){
                isRowFull = isRowFull && (board[r][c] != EMPTY);
            }
            if(isRowFull){
                // if the row is full
                // we move down all the rows above it
                for( y = r; y > 1; y--){
                    for( c = 0; c < COL; c++){
                        board[y][c] = board[y-1][c];
                    }
                }
                // the top row board[0][..] has no row above it
                for( c = 0; c < COL; c++){
                    board[0][c] = EMPTY;
                }
                // increment the score
                score += 10;
            }
        }
        // update the board
        drawBoard();
        
        // update the score
        scoreElement.innerHTML = score;
    }
    
}   

// generate random pieces

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) 
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();



// move pieces with keystroke

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

let score = 0;




// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();



















