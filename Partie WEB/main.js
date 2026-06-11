const W = 1200;
const H = 800;
const TRAIL_LENGTH = 50000;

let stars = [];
let data;
let trail = [];
let frameIndex = 0;
let totalSteps = 0;
let earthX, earthY;
let slider, sliderLabel, timeLabel;

function preload() {
    data = loadJSON('terre.json');
}

function setup() {
    createCanvas(W, H);

    for (let i = 0; i < 300; i++) {
        stars.push({ x: random(W), y: random(H), size: random(1, 3), brightness: random(150, 255) });
    }

    slider = createSlider(1, 961, 1, 24);
    slider.position(10, 10);
    slider.style('width', '240px');

    sliderLabel = createP('').position(10, 35).style('color', 'white').style('font-size', '14px');
    timeLabel   = createP('').position(10, 60).style('color', 'white').style('font-size', '14px');
}

function formatSpeed(h) {
    if (h < 24)  return `${h} hour${h === 1 ? '' : 's'}`;
    if (h < 168) return `${(h / 24).toFixed(1)} days`;
    if (h < 720) return `${(h / 168).toFixed(1)} weeks`;
                 return `${(h / 720).toFixed(1)} months`;
}

function formatElapsed(h) {
    if (h < 24)   return `${floor(h)}h`;
    if (h < 168)  return `${floor(h / 24)}d ${floor(h % 24)}h`;
    if (h < 720)  return `${floor(h / 168)}w ${floor(h % 168 / 24)}d`;
    if (h < 8760) return `${floor(h / 720)}mo ${floor(h % 720 / 168)}w`;
                  return `${floor(h / 8760)}y ${floor(h % 8760 / 720)}mo`;
}

function draw() {
    background(0);

    const trajectory = data["Terre"];

    noStroke();
    for (const { x, y, size, brightness } of stars) {
        fill(brightness);
        circle(x, y, size);
    }

    fill(255, 220, 0, 40); circle(W / 2, H / 2, 80);
    fill(255, 180, 0);     circle(W / 2, H / 2, 50);

    if (!trajectory?.length) return;

    const sampleInterval = trajectory.length > 1
        ? Math.max(1, Math.round(trajectory[1][2] - trajectory[0][2]))
        : 60;

    const speedFactor = slider.value();
    const advanceBy   = Math.max(1, Math.round((speedFactor * 3600) / sampleInterval));

    sliderLabel.html(`Speed: ${formatSpeed(speedFactor)} per frame`);

    if (earthX !== undefined && earthY !== undefined) {
        trail.push({ x: earthX, y: earthY });
        if (trail.length > TRAIL_LENGTH / (speedFactor * 3600 / sampleInterval)) trail.shift();
    }

    const [px, py] = trajectory[frameIndex][0];
    earthX = px / 500_000_000 + W / 2;
    earthY = py / 500_000_000 + H / 2;

    if (trail.length > 1) {
        noFill();
        stroke(0, 120, 255, 200);
        strokeWeight(1.5);
        beginShape();
        for (const { x, y } of trail) vertex(x, y);
        endShape();
    }

    noStroke();
    fill(0, 120, 255);
    circle(earthX, earthY, 20);

    totalSteps += advanceBy;
    timeLabel.html(`Elapsed: ${formatElapsed(totalSteps * sampleInterval / 3600)}`);

    frameIndex = (frameIndex + advanceBy) % trajectory.length;
}