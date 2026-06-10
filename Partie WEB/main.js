let windowWidth = 1300;
let windowHeight = 850;
let stars = [];

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
}

function draw() {
    background(0);

    // Étoiles
    noStroke();
    fill(255);

    for (let star of stars) {
    fill(star.brightness);
    circle(star.x, star.y, star.size);
    }

    // Soleil
    noStroke();

    // Halo lumineux
    fill(255, 220, 0, 40);
    circle(width / 2, height / 2, 80);

    // Corps du Soleil
    fill(255, 180, 0);
    circle(width / 2, height / 2, 50);

    // Orbite de la Terre
    noFill();
    stroke(60);
    strokeWeight(1);
    circle(width / 2, height / 2, 300);

    // Terre
    let earthX = width / 2 + 150 * cos(frameCount * 0.01);
    let earthY = height / 2 + 150 * sin(frameCount * 0.01);

    // Halo bleu
    noStroke();
    fill(100, 150, 255, 40);
    circle(earthX, earthY, 40);

    // Corps de la Terre
    fill(30, 120, 255);
    stroke(180, 220, 255);
    strokeWeight(2);
    circle(earthX, earthY, 30);

    // Continents
    noStroke();
    fill(50, 180, 50);
    circle(earthX - 5, earthY - 4, 8);
    circle(earthX + 4, earthY + 2, 6);
    circle(earthX - 2, earthY + 7, 5);

    // Reflet lumineux
    fill(255, 255, 255, 120);
    circle(earthX - 6, earthY - 6, 7);
}