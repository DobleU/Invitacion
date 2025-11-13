const honey = document.getElementById('honey');
const beesHive = document.getElementById('bees');

honey.style.left = window.innerWidth / 2 + 'px';
honey.style.top = window.innerHeight / 2 + 'px';

const honeyOffset = honey.getBoundingClientRect();
const honeyX = honeyOffset.x;
const honeyY = honeyOffset.y;
const BEES_COUNT = 10;
const bees = [];

class Bee {
  constructor(honeyX, honeyY) {
    this.bee = document.createElement('div');
    this.bee.innerText = '🐝';
    this.bee.classList.add('bee');
    this.bee.style.left = honeyX + 'px';
    this.bee.style.top = honeyY + 'px';
    this.beeX = honeyX;
    this.beeY = honeyY;
    this.honeyX = honeyX;
    this.honeyY = honeyY;
    this.multiplyX = 1;
    this.multiplyY = -1;
    this.flyRange = 30;
    this.stepX = Math.random() * 1 + .3;
    this.stepY = Math.random() * 1 + .3;
  }
  
  free() {
    beesHive.appendChild(this.bee);
  }
  
  fly() {
    if (this.beeX > this.honeyX + this.flyRange) {
      this.multiplyX = -1;
    }
    if (this.beeX < this.honeyX - this.flyRange) {
      this.multiplyX = 1;
    }
    if (this.beeY > this.honeyY + this.flyRange) {
      this.multiplyY = -1;
    }
    if (this.beeY < this.honeyY - this.flyRange) {
      this.multiplyY = 1;
    }
    
    // bee flys faster when the honey is far
    let absDistanceToHoneyX = Math.abs(this.beeX - this.honeyX);
    let absDistanceToHoneyY = Math.abs(this.beeY - this.honeyY);
    let multiplyStepX = (absDistanceToHoneyX - this.flyRange > 0) ? Math.min(absDistanceToHoneyX * .01 + 5, 10) : 1;
    let multiplyStepY = (absDistanceToHoneyY - this.flyRange > 0) ? Math.min(absDistanceToHoneyY * .01 + 5, 10) : 1;
    
    this.beeX += this.stepX * multiplyStepX * this.multiplyX;
    this.beeY += this.stepY * multiplyStepY * this.multiplyY;
    this.bee.style.left = this.beeX + 'px';
    this.bee.style.top = this.beeY + 'px';
    
    // bee watch on honey
    this.bee.style.transform = this.beeX > this.honeyX ? '' : 'scale(-1, 1)';
  }
  
  // Every bee should know where the honey is
  setHoneyPosition(x, y) {
    this.honeyX = x;
    this.honeyY = y;
  }
}

for (let i = 0; i < BEES_COUNT; i++) {
  let bee = new Bee(honeyX, honeyY);
  bee.free();
  bees.push(bee);
}

function animate() {
  bees.forEach(bee => bee.fly());
  requestAnimationFrame(animate);
}

animate();

var mousePosition;
var offset = [0,0];
var isDown = false;

function startMove(e) {
  isDown = true;
  let clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  let clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
  offset = [
      honey.offsetLeft - clientX,
      honey.offsetTop - clientY
  ];
}

function endMove() {
  isDown = false;
}

function move(e) {
  // event.preventDefault();
  if (isDown) {
    let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    let clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    mousePosition = {
      x : clientX,
      y : clientY
    };
    let x = mousePosition.x + offset[0];
    let y = mousePosition.y + offset[1];
    honey.style.left = x + 'px';
    honey.style.top  = y + 'px';
    bees.forEach(bee => bee.setHoneyPosition(x, y));
  }
}

honey.addEventListener('mousedown', startMove, true);
document.addEventListener('mouseup', endMove, true);
document.addEventListener('mousemove', move, true);
honey.addEventListener('touchstart', startMove, true);
document.addEventListener('touchend', endMove, true);
document.addEventListener('touchmove', move, true);

setTimeout(() => {
   // bees.forEach(bee => bee.setHoneyPosition(100, 200));
}, 2000);