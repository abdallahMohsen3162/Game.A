let ctx = document.querySelector("canvas");
let c = ctx.getContext("2d");

ctx.width = innerWidth
ctx.height = innerHeight;

let h = ctx.height,
    w = ctx.width;

let COUNTER = 0;
let mp = new Map();
mp["white"] = 10;
mp["red"] = -10;

let clrs = [
    "white",
    "red"
];

class Rectangle {
    constructor(x, y, w, h, color = "#ececec") {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.jump = 20;

    }
    drow = () => {
        c.beginPath();
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update = () => {

        this.drow();

    }
    rightmove = () => {
        if (this.jump + this.w + this.x > w) return;
        rects[0].x += (rects[0].w / 3);
    }
    lefttmove = () => {
        if (this.x - this.jump < 0) return;
        rects[0].x -= (rects[0].w / 3);
    }

    grow = (ddw) => {
        if (this.w + ddw <= 100 || this.w + ddw >= 500) return;
        this.w += ddw;
    }
}


function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;
    return Math.sqrt(
        Math.pow(xDist, 2) + Math.pow(yDist, 2)
    );
}

function randomIntFromRange(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    );
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}


function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.vel.x - otherParticle.vel.x;
    const yVelocityDiff = particle.vel.y - otherParticle.vel.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;


    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {


        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);


        const m1 = particle.mass;
        const m2 = otherParticle.mass;


        const u1 = rotate(particle.vel, angle);
        const u2 = rotate(otherParticle.vel, angle);


        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };


        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);


        particle.vel.x = vFinal1.x;
        particle.vel.y = vFinal1.y;

        otherParticle.vel.x = vFinal2.x;
        otherParticle.vel.y = vFinal2.y;
    }
}


let circles = [];
let rects = [];


function gain(d) {
    let score = document.querySelector(".scr");
    COUNTER += d;
    score.innerHTML = COUNTER;
}

class Circle {
    constructor(x, y, radius, dx, dy, color = "white") {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.mass = 10;
        this.vel = {
            x: dx,
            y: dy
        }
    }

    drow() {
        let temp = c.fillStyle;
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fill();
        c.fillStyle = temp;
    }

    update() {


        if (this.y - this.radius >= h) {
            let indx = 0;
            for (let i = 0; i < circles.length; i++) {
                if (circles[i] == this) {
                    indx = i;
                    break;
                }
            }
            circles.splice(indx, 1);
        }

        for (let i = 0; i < circles.length; ++i) {
            if (this === circles[i]) continue;
            let d = distance(this.x, this.y, circles[i].x, circles[i].y);
            if (d - this.radius * 2 < 0) {
                resolveCollision(this, circles[i])
            }
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
        if (this.x + this.radius >= w || this.x - this.radius <= 0) {
            this.vel.x = -this.vel.x;
        }

        if (this.y - this.radius <= 0) {
            this.vel.y = -this.vel.y;
        }

        if (this.x + this.radius >= rects[0].x && this.x + this.radius <= rects[0].x + rects[0].w) {
            if (this.y + this.radius >= rects[0].y && this.y + this.radius <= rects[0].y + rects[0].h) {
                this.vel.y = -this.vel.y;
                rects[0].grow(mp[this.color]);
                if (this.color == 'white') gain(1);
                else gain(-1);
                console.log(COUNTER);


                let indx = 0;
                for (let i = 0; i < circles.length; i++) {
                    if (circles[i] == this) {
                        indx = i;
                        break;
                    }
                }
                circles.splice(indx, 1);

            }
        }

        this.drow();
    }
}


let HHH = 10;
rects.push(new Rectangle(w / 2, h - (HHH), 200, HHH));




function generate() {
    let r = 10;
    // let clr = 'red';
    let clr = clrs[Math.floor(Math.random() * clrs.length)];
    let x = randomIntFromRange(r, w - r);
    // let y = randomIntFromRange(r, h - r);
    let dx = (Math.random() - 0.5) * 40;
    circles.push(new Circle(x, r + 1, r, dx, -3, clr));
}



document.onkeydown = function(e) {
    let jump = 10;
    if (e.keyCode == 39 && rects[0].x + rects[0].w + jump <= w) {
        rects[0].rightmove();
    } else if (e.keyCode == 37 && rects[0].x - jump >= 0) {
        rects[0].lefttmove();
    }
}

let timer = setInterval(generate, 1000);

function animation() {
    c.clearRect(0, 0, w, h);

    for (let i = 0; i < circles.length; i++) {
        circles[i].update();
    }

    for (let i = 0; i < rects.length; i++) {
        rects[i].update();
    }


    requestAnimationFrame(animation);
}
requestAnimationFrame(animation);