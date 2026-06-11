let windowWidth = 1200;
let windowHeight = 800;
let stars = [];
let data;
let trajectoire;
let tPoint;
let position;
let earthX;
let earthY;
let frameIndex = 0;
let trail = [];
let TRAIL_LENGTH = 50000;
let slider;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            size: random(1, 3),
            brightness: random(150, 255)
        });
    }
    slider = createSlider(1, 100, 1);
    slider.position(10, 10);
}

function preload() {
    data = loadJSON('mercury.json');
}

function draw() {
    background(0);

    trajectoire = data["mercury-euler"];

    noStroke();
    for (let star of stars) {
        fill(star.brightness);
        circle(star.x, star.y, star.size);
    }
    //SOLEIL
    noStroke();
    fill(255, 220, 0, 40);
    circle(width / 2, height / 2, 80);
    fill(255, 180, 0);
    circle(width / 2, height / 2, 50);

    //TERRE
    if (trajectoire && trajectoire.length > 0) {
        tPoint = trajectoire[frameIndex];
        position = tPoint[0];

        trail.push({ x: earthX, y: earthY });
        if (trail.length > TRAIL_LENGTH) {
            trail.shift();
        }

        earthX = position[0] / 500000000 + width / 2;
        earthY = position[1] / 500000000 + height / 2;

        noStroke();
        for (let i = 0; i < trail.length; i++) {
            let alpha = map(i, 0, trail.length - 1, 0, 255);
            let size = map(i, 0, trail.length - 1, 2, 10);
            fill(0, 100, 255, alpha);
            circle(trail[i].x, trail[i].y, size);
        }

        fill(0, 100, 255);
        circle(earthX, earthY, 20);

        frameIndex++;

        if (frameIndex >= trajectoire.length) {
            frameIndex = 0;
        }
    }
}