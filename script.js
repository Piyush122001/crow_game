// canvas raven
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = window.innerWidth;
const canvasHeight = canvas.height = window.innerHeight;

//----------------------------------------------------------------
// canvas collision 
//----------------------------------------------------------------
const collision = document.getElementById('collision');
const collCtx = collision.getContext('2d');
const canvasCollWidth = collision.width = window.innerWidth;
const canvasCollHeight = collision.height = window.innerHeight;

ctx.font='50px impact';
let timeToNextRaven =0;
let ravenInterval = 500;
let lastTime=0;
let deltaTime = 0;
let score = 0;
let gameOver = false;
// ----------------------------------------------------------------
// Raven class
// ----------------------------------------------------------------
let ravens = [];
class Raven{
    constructor(){
        this.spriteWidth = 271 ;
        this.spritHeight = 194;
        this.sizeSeter = Math.random()*0.3 +0.5;
        this.width=this.spriteWidth*this.sizeSeter;
        this.height=this.spritHeight*this.sizeSeter;
        this.x = canvas.width;
        this.y = Math.random()*(canvas.height-this.height);
        this.directionX = Math.random()*5+3;
        this.directionY=Math.random()*3-2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "images/raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.flapping = 0;
        this.flappingInterval =Math.random()*100+50;
        this.randomColor = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255) ]
        this.color='rgb('+this.randomColor[0]+', '+this.randomColor[1]+', '+this.randomColor[2]+')';
        this.hasTrail = Math.random() >0.5;
    }
    update(deltaTime){
        if(this.y<0|| this.y>canvasHeight-this.height){
            this.directionY = this.directionY*-1;
        }
        this.x -=this.directionX;
        this.y +=this.directionY;
        this.flapping +=deltaTime;
        if(this.flapping>this.flappingInterval){
            if(this.frame>this.maxFrame)this.frame =0;
            else this.frame++;
            this.flapping=0;
            if(this.hasTrail){
                for(let i=0;i<5;i++){
                    particles.push(new Particle(this.x,this.y,this.width,this.color))
                }
            }
        }
        // if(this.x < 0-this.width) this.markedForDeletion = true;
        if(this.x < 0-this.width) gameOver = true;
    }

    draw(){
        collCtx.fillStyle=this.color;
        collCtx.fillRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spritHeight,this.x,this.y,this.width,this.height);
    }
}

// ----------------------------------------------------------------
// Explosion 
//----------------------------------------------------------------
let explosion =[];
class explosionCloud {
    constructor(x,y,size){
        this.image = new Image();
        this.image.src ='images/boom.png';
        this.spriteHeight = 179;
        this.spriteWidth = 200;
        this.size = size;
        this.x =x;
        this.y=y;
        this.frame=0;
        this.sound= new Audio();
        this.sound.src= 'damage_sound1.mp4';
        this.timeSinceLastFrame=0;
        this.frameInterval = 200;
        this.markedForDeletion= false; this
    }
    update(deltaTime){
        if(this.frame===0) this.sound.play();
        this.timeSinceLastFrame+=deltaTime;
        if(this.timeSinceLastFrame>this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame=0;
            if(this.frame>5){this.markedForDeletion=true;}

        }
    }
    draw(){ 
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y-this.size/4,this.size,this.size);
    }
}

// ----------------------------------------------------------------
//Particle class 
//----------------------------------------------------------------

let particles = [];
class Particle{
    constructor(x,y,size,color){
        this.size=size;
        this.x = x+this.size/2 +Math.random()*50 -25;
        this.y = y+this.size/3+Math.random()*50 -25; 
        this.radius = Math.random() *this.size/10;
        this.maxRadius = Math.random() * 20 +35;
        this.markedForDeletion = false; this
        this.speedX = Math.random() *1 +0.5;
        this.color = color;
        // this.color= 'white';
    }
    update(){
        this.x += this.speedX;
        this.radius +=0.2;
        if(this.radius > this.maxRadius-5)this.markedForDeletion = true; 
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1-this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle= this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}


// ----------------------------------------------------------------
// Score board
// ----------------------------------------------------------------
function drawScore(){
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+score,50,75);
}

//----------------------------------------------------------------
//Game Over   
//----------------------------------------------------------------
function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAMEOVER, your game score: '+score,canvasWidth/2,canvasHeight/2 );
}

// ----------------------------------------------------------------
// Collision detectetion & click event
// ----------------------------------------------------------------
window.addEventListener("click",function(e){
    const detectPixelColor = collCtx.getImageData(e.x,e.y,1,1);
    // console.log(detectPixelColor);
    const pixel = detectPixelColor.data;
    ravens.forEach(obj=> {
        if(obj.randomColor[0]===pixel[0]&&obj.randomColor[1]===pixel[1]&&obj.randomColor[2]===pixel[2]){
            obj.markedForDeletion = true; 
            score++;
            explosion.push(new explosionCloud(obj.x,obj.y,obj.width))
            console.log(explosion)
        }
    });
})
const raven = new Raven();

//----------------------------------------------------------------
// Animation loop
//----------------------------------------------------------------

function animate(timeStamp){
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    collCtx.clearRect(0,0,canvasWidth,canvasHeight);

    deltaTime = timeStamp -lastTime;
    lastTime = timeStamp;
    timeToNextRaven += deltaTime;
    if(timeToNextRaven>ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width;
        })
    }
    drawScore();
    [...particles,...ravens,...explosion].forEach(obj =>obj.update(deltaTime));
    [...particles,...ravens,...explosion].forEach(obj =>obj.draw ());
    ravens = ravens.filter(obj=>!obj.markedForDeletion);
    explosion = explosion.filter(obj=>!obj.markedForDeletion);
    particles = particles.filter(obj=>!obj.markedForDeletion);
    // ravens.forEach(raven => {
    //     raven.draw();
    //     raven.update();
    // })
    if(!gameOver)requestAnimationFrame(animate);
    else drawGameOver();
}
animate(0);

