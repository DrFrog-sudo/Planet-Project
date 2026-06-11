const W = 1200;
const H = 800;
const TRAIL_LENGTH = 50000;

let stars = [];
let data;
let trail = [];
let frameIndex = 0;
let totalSteps = 0;
let earthRawX = 0;
let earthRawY = 0;
let sliderSpeed, sliderSpeedLabel, timeLabel;
let sliderZoom, sliderZoomLabel;
let offsetX = 0;
let offsetY = 0;

let selectedPlanet = 'Terre';
let energyHistory = [];
let methodSelect;
let selectedMethod = '';
const MAX_GRAPH_POINTS = 200;

function preload() {
    // Load the single JSON file with all methods (do not split)
    data = loadJSON('terre.json');
}

function setup() {
    createCanvas(W, H);

    for (let i = 0; i < 300; i++) {
        stars.push({ x: random(W), y: random(H), size: random(1, 3), brightness: random(150, 255) });
    }

    sliderSpeed = createSlider(1, 961, 1, 24);
    sliderSpeed.position(10, 10);
    sliderSpeed.style('width', '240px');
    sliderSpeedLabel = createP('').position(10, 35).style('color', 'white').style('font-size', '14px');
    timeLabel = createP('').position(10, 60).style('color', 'white').style('font-size', '14px');

    sliderZoom = createSlider(5, 50, 50, 1);
    sliderZoom.position(10, 90);
    sliderZoom.style('width', '240px');
    sliderZoomLabel = createP('').position(10, 115).style('color', 'white').style('font-size', '14px');

    // Dropdown to choose calculation method (Euler, RK4, Euler asymétrique)
    const methodLabel = createP('Méthode :').position(10, 120).style('color', 'white').style('font-size', '14px').style('margin', '0');
    methodSelect = createSelect();
    methodSelect.position(10, 145);
    methodSelect.style('width', '240px');
    methodSelect.changed(() => {
        selectedMethod = methodSelect.value();
        // Reset simulation state when switching method
        frameIndex = 0;
        trail = [];
        energyHistory = [];
        totalSteps = 0;
        earthRawX = 0;
        earthRawY = 0;
    });
    // Populate options now if data already loaded (preload ran before setup)
    if (data) {
        let methodKeys = Object.keys(data).filter(key => /euler|rk4/i.test(key));
        if (methodKeys.length === 0) methodKeys = Object.keys(data);
        for (let key of methodKeys) {
            let label = key.replace(/Terre\s*-\s*/i, '');
            label = label.replace(/Euler Asym/i, 'Euler asymétrique');
            methodSelect.option(label, key);
        }
        selectedMethod = methodKeys.length ? methodKeys[0] : '';
        methodSelect.selected(selectedMethod);
    }
}

function formatSpeed(h) {
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'}`;
    if (h < 168) return `${(h / 24).toFixed(1)} days`;
    if (h < 720) return `${(h / 168).toFixed(1)} weeks`;
    return `${(h / 720).toFixed(1)} months`;
}

function formatElapsed(h) {
    if (h < 24) return `${floor(h)}h`;
    if (h < 168) return `${floor(h / 24)}d ${floor(h % 24)}h`;
    if (h < 720) return `${floor(h / 168)}w ${floor(h % 168 / 24)}d`;
    if (h < 8760) return `${floor(h / 720)}mo ${floor(h % 720 / 168)}w`;
    return `${floor(h / 8760)}y ${floor(h % 8760 / 720)}mo`;
}

function drawStars() {
    noStroke();
    for (const { x, y, size, brightness } of stars) {
        fill(brightness);
        circle(x, y, size);
    }
}

function drawSoleil() {
    noStroke();
    fill(255, 220, 0, 40); circle(W / 2 + offsetX, H / 2 + offsetY, 80 * sliderZoom.value() / 10);
    fill(255, 180, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 50 * sliderZoom.value() / 10);
    fill(255, 150, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 30 * sliderZoom.value() / 10);
    fill(255, 120, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 20 * sliderZoom.value() / 10);
    fill(255, 100, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 10 * sliderZoom.value() / 10);
    fill(255, 80, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 5 * sliderZoom.value() / 10);
    fill(255, 60, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 3 * sliderZoom.value() / 10);
    fill(255, 40, 0); circle(W / 2 + offsetX, H / 2 + offsetY, 2 * sliderZoom.value() / 10);
}

function drawTerre(zoom) {
    let trajectory;

    if (selectedMethod && data[selectedMethod]) {
        trajectory = data[selectedMethod];
    } else if (data["Terre"]) {
        trajectory = data["Terre"];
    } else {
        trajectory = data[Object.keys(data)[0]];
    }

    if (!trajectory || trajectory.length === 0) return;

    const sampleInterval = trajectory.length > 1
        ? Math.max(1, Math.round(trajectory[1][2] - trajectory[0][2]))
        : 60;

    const speedFactor = sliderSpeed.value();
    const advanceBy = Math.max(1, Math.round((speedFactor * 3600) / sampleInterval));

    sliderSpeedLabel.html(`Speed: ${formatSpeed(speedFactor)} per frame`);

    if (earthRawX !== 0 || earthRawY !== 0) {
        trail.push({ x: earthRawX, y: earthRawY });
        let maxTrailPoints = TRAIL_LENGTH / ((speedFactor * 3600) / sampleInterval);
        if (maxTrailPoints < 2) maxTrailPoints = 2;
        while (trail.length > maxTrailPoints) {
            trail.shift();
        }
    }

    const prevFrameIndex = frameIndex;
    frameIndex = (frameIndex + advanceBy) % trajectory.length;

    if (!trajectory[frameIndex] || !trajectory[0]) return;

    const [px, py] = trajectory[frameIndex][0];
    earthRawX = px / 500_000_000;
    earthRawY = py / 500_000_000;

    let currentEc = trajectory[frameIndex][3];
    let currentEp = trajectory[frameIndex][4];
    let currentEm = trajectory[frameIndex][5];

    // On récupère les valeurs au tout premier point , quand t=0
    let initEc = trajectory[0][3];
    let initEp = trajectory[0][4];
    let initEm = trajectory[0][5];

    // On soustrait la valeur initiale pour n'afficher que le delta
    let deltaEc = currentEc - initEc;
    let deltaEp = currentEp - initEp;
    let deltaEm = currentEm - initEm;

    energyHistory.push({ dEc: deltaEc, dEp: deltaEp, dEm: deltaEm });
    if (energyHistory.length > MAX_GRAPH_POINTS) {
        energyHistory.shift();
    }

    if (trail.length > 1) {
        noFill();
        stroke(0, 120, 255, 200);
        strokeWeight(1.5);
        beginShape();
        for (const { x, y } of trail) vertex(x * zoom + W / 2 + offsetX, y * zoom + H / 2 + offsetY);
        endShape();
    }

    let ex = earthRawX * zoom + W / 2 + offsetX;
    let ey = earthRawY * zoom + H / 2 + offsetY;
    let r = 20 * zoom;

    noStroke();
    fill(0, 120, 255);
    circle(ex, ey, r);

    fill(34, 139, 34);
    circle(ex - r * 0.2, ey - r * 0.1, r * 0.4);
    circle(ex + r * 0.2, ey + r * 0.2, r * 0.3);
    circle(ex - r * 0.1, ey + r * 0.3, r * 0.2);

    if (selectedPlanet === 'Terre') {
        noFill();
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        circle(ex, ey, r + 10);
    }

    totalSteps += advanceBy;
    timeLabel.html(`Elapsed: ${formatElapsed(totalSteps * sampleInterval / 3600)}`);
}

function drawGraphs() {
    if (selectedPlanet !== 'Terre' || energyHistory.length < 2) return;

    let gW = 220;
    let gH = 90;
    let yStart = H - gH - 100; 
    let totalWidth = 3 * gW + 40; // 2 espaces de 20px
    let startX = (W - totalWidth) / 2;
    let xStarts = [startX, startX + gW + 20, startX + 2 * (gW + 20)];
    
    let keys = ['dEc', 'dEp', 'dEm'];
    let titles = ['ΔEc', 'ΔEp', 'ΔEm']; // Titres plus courts pour les petits graphes
    let colors = [color(255, 80, 80), color(80, 255, 80), color(255, 255, 80)];

    let globalMin = energyHistory[0].dEc;
    let globalMax = energyHistory[0].dEc;

    for (let pt of energyHistory) {
        for (let key of keys) {
            if (pt[key] < globalMin) globalMin = pt[key];
            if (pt[key] > globalMax) globalMax = pt[key];
        }
    }

    let absoluteDiff = abs(globalMax - globalMin);
    if (absoluteDiff === 0) {
        globalMin -= 1;
        globalMax += 1;
    } else {
        globalMin -= absoluteDiff * 0.15;
        globalMax += absoluteDiff * 0.15;
    }

    for (let i = 0; i < 3; i++) {
        let xStart = xStarts[i];
        let key = keys[i];

        fill(15, 15, 25, 230);
        stroke(0, 120, 255, 60);
        strokeWeight(1.5);
        rect(xStart, yStart, gW, gH, 10);

        let yZero = map(0, globalMin, globalMax, yStart + gH - 15, yStart + 30);
        if (isFinite(yZero) && yZero > yStart + 30 && yZero < yStart + gH - 15) {
            stroke(255, 255, 255, 40);
            strokeWeight(1);
            line(xStart + 10, yZero, xStart + gW - 10, yZero);
            
            // Label 0
            noStroke();
            fill(255, 255, 255, 120);
            textSize(9);
            textStyle(NORMAL);
            textAlign(RIGHT, BOTTOM);
            text("0", xStart + gW - 12, yZero - 2);
        }

        noStroke();
        fill(240);
        textSize(12);
        textStyle(BOLD);
        textAlign(LEFT, TOP);
        text(titles[i], xStart + 10, yStart + 8);
        
        // Labels Max / Min
        noStroke();
        fill(255, 255, 255, 120);
        textSize(9);
        textStyle(NORMAL);
        textAlign(RIGHT, TOP);
        let maxStr = globalMax > 0 ? "+" + globalMax.toExponential(1) : globalMax.toExponential(1);
        text(maxStr, xStart + gW - 12, yStart + 32);
        
        textAlign(RIGHT, BOTTOM);
        let minStr = globalMin > 0 ? "+" + globalMin.toExponential(1) : globalMin.toExponential(1);
        text(minStr, xStart + gW - 12, yStart + gH - 17);

        noFill();
        stroke(colors[i]);
        strokeWeight(2); // Trait un peu plus fin pour les petits graphes
        strokeJoin(ROUND);
        beginShape();
        for (let j = 0; j < energyHistory.length; j++) {
            let vx = map(j, 0, energyHistory.length - 1, xStart + 10, xStart + gW - 10);
            let vy = map(energyHistory[j][key], globalMin, globalMax, yStart + gH - 15, yStart + 30);
            if (isFinite(vx) && isFinite(vy)) {
                vertex(vx, vy);
            }
        }
        endShape();
        textStyle(NORMAL);
    }
}

function mousePressed() {
    if (mouseX < 260 && mouseY < 150) return;

    const zoom = sliderZoom.value() / 10;
    let ex = earthRawX * zoom + W / 2 + offsetX;
    let ey = earthRawY * zoom + H / 2 + offsetY;
    let r = 20 * zoom;

    if (dist(mouseX, mouseY, ex, ey) < r / 2 + 10) {
        selectedPlanet = (selectedPlanet === 'Terre') ? null : 'Terre';
    }
}

function mouseDragged() {
    if (mouseX > 260 || mouseY > 150) {
        offsetX += mouseX - pmouseX;
        offsetY += mouseY - pmouseY;
    }
}

function draw() {
    background(5, 5, 12);

    const zoom = sliderZoom.value() / 10;
    sliderZoomLabel.html(`Zoom: ${zoom.toFixed(1)}x`);

    drawStars();
    drawSoleil();
    drawTerre(zoom);
    drawGraphs();
}