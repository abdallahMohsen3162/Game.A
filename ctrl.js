let ctx = document.querySelector("canvas");
let c = ctx.getContext("2d");

ctx.width = innerWidth
ctx.height = innerHeight;

let h = ctx.height,
    w = ctx.width;

class Rectangle {
    constructor(x, y, w, h, color = "balck") {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }
    drow = () => {
        c.beginPath();
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update = () => {
        this.drow();
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

function grow(dw) {
    rects[0].w += dw;
}


class Circle {
    constructor(x, y, radius, dx, dy, color = "black") {
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

        if (this.x + this.radius >= rects[0].x && this.x + this.radius < rects[0].x + rects[0].w) {
            if (this.y + this.radius >= rects[0].y) {
                this.vel.y = -this.vel.y;
                grow(10);
            }
        }
        // if (this.y + this.radius >= h || this.y - this.radius <= 0) {
        //     this.vel.y = -this.vel.y;
        // }
        this.drow();
    }
}


let HHH = 10;
rects.push(new Rectangle(w / 2, h - (HHH + 20), 200, HHH));

for (let i = 0; i < 1; i++) {
    let r = 10;
    let x = randomIntFromRange(r, w - r);
    let y = randomIntFromRange(r, h - r);
    circles.push(new Circle(x, y, r, 1, -10));
}

document.onkeydown = function(e) {
    let jump = 10;
    if (e.keyCode == 39 && rects[0].x + rects[0].w + jump <= w) {
        rects[0].x += 10;
    } else if (e.keyCode == 37 && rects[0].x - jump >= 0) {
        rects[0].x -= 10;
    }
}

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