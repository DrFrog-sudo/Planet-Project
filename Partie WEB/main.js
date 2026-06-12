function preload() {
    data = loadJSON('systeme_solaire.json');
    imgSoleil = loadImage('sunTexture.jpg');
    imgMercure = loadImage('mercury.jpg');
    imgVenus = loadImage('venus.jpg');
    imgTerre = loadImage('terreTexture.jpg');
    imgMars = loadImage('mars.jpg');
}

function setup() {
    W = windowWidth;
    H = windowHeight;
    createCanvas(W, H, WEBGL);

    for (let i = 0; i < 500; i++) {
        stars.push({
            x: random(-2000, 2000),
            y: random(-2000, 2000),
            z: random(-2000, 2000),
            size: random(1.5, 4)
        });
    }

    panel = createDiv('');
    panel.position(5, 5);
    panel.size(280, 240);
    panel.style('background', 'rgba(15,20,35,0.85)');
    panel.style('border', '1px solid rgba(77,166,255,0.5)');
    panel.style('border-radius', '15px');
    panel.style('backdrop-filter', 'blur(10px)');
    panel.style('box-shadow', '0 0 20px rgba(77,166,255,0.3)');
    panel.style('padding', '15px');
    panel.style('color', '#fff');
    panel.style('font-family', 'sans-serif');

    let title = createDiv('Système Solaire N-Corps');
    title.parent(panel);
    title.style('font-weight', 'bold');
    title.style('font-size', '16px');
    title.style('margin-bottom', '15px');
    title.style('color', '#4da6ff');

    sliderSpeedLabel = createDiv('Vitesse: 1x');
    sliderSpeedLabel.parent(panel);
    sliderSpeed = createSlider(1, 100, 1);
    sliderSpeed.parent(panel);
    sliderSpeed.style('width', '100%');
    sliderSpeed.style('margin-bottom', '10px');
    sliderSpeed.input(() => {
        sliderSpeedLabel.html(`Vitesse: ${sliderSpeed.value()}x`);
    });

    sliderZoomLabel = createDiv('Zoom: 1.0x');
    sliderZoomLabel.parent(panel);
    sliderZoom = createSlider(1, 100, 10);
    sliderZoom.parent(panel);
    sliderZoom.style('width', '100%');
    sliderZoom.style('margin-bottom', '15px');

    timeLabel = createDiv('Temps: 0 jours');
    timeLabel.parent(panel);
    timeLabel.style('margin-bottom', '15px');
    timeLabel.style('font-size', '13px');

    methodSelect = createSelect();
    methodSelect.parent(panel);
    methodSelect.style('width', '100%');
    methodSelect.style('padding', '5px');
    methodSelect.style('background', '#0f1423');
    methodSelect.style('color', '#fff');
    methodSelect.style('border', '1px solid #4da6ff');
    methodSelect.style('border-radius', '5px');

    if (data) {
        let methodKeys = Object.keys(data);
        for (let key of methodKeys) {
            if (key.includes("Terre") || !key.includes(" - ")) {
                let label = key.replace(/Terre\s*-\s*/i, '').replace(/Euler Asym/i, 'Euler asymétrique');
                methodSelect.option(label, key);
            }
        }
        selectedMethod = methodKeys.length ? methodKeys[0] : '';
        methodSelect.selected(selectedMethod);
    }

    methodSelect.changed(() => {
        selectedMethod = methodSelect.value();
        frameIndex = 0;
        energyHistory = [];
        trailMercury = [];
        trailVenus = [];
        trailEarth = [];
        trailMars = [];
    });
}

function draw() {
    background(5, 5, 12);

    const zoom = sliderZoom.value() / 10;
    sliderZoomLabel.html(`Zoom: ${zoom.toFixed(1)}x`);

    orbitControl(2, 2, 0.1);

    drawStars();
    drawSoleil(zoom);
    updateAndDrawPlanets(zoom);
    drawGraphs();
}

function mousePressed() {
    if (mouseX < 260 && mouseY < 240) return;

    const zoom = sliderZoom.value() / 10;
    let mx = mouseX - W / 2;
    let my = mouseY - H / 2;

    let planetsToCheck = [
        { name: 'Mercure', x: mercuryRawX, y: mercuryRawY, r: 8 },
        { name: 'Venus', x: venusRawX, y: venusRawY, r: 12 },
        { name: 'Terre', x: earthRawX, y: earthRawY, r: 14 },
        { name: 'Mars', x: marsRawX, y: marsRawY, r: 10 }
    ];

    for (let p of planetsToCheck) {
        let px = p.x * zoom;
        let py = p.y * zoom;
        let d = dist(mx, my, px, py);
        if (d < p.r + 10) {
            selectedPlanet = p.name;
            break;
        }
    }
}

function drawStars() {
    push();
    for (let s of stars) {
        stroke(255, 255, 255, 200);
        strokeWeight(s.size);
        point(s.x, s.y, s.z);
    }
    pop();
}

function drawSoleil(zoom) {
    push();
    translate(0, 0, 0);
    noStroke();
    if (imgSoleil) {
        texture(imgSoleil);
    } else {
        fill(255, 200, 0);
    }
    sphere(30);
    pop();
}

function updateAndDrawPlanets(zoom) {
    if (!data || !selectedMethod) return;

    let methodSuffix = selectedMethod.includes(" - ") ? selectedMethod.split(" - ")[1] : selectedMethod;

    let pMercure, pVenus, pTerre, pMars;
    let baseData = data[selectedMethod] || data[methodSuffix];

    if (baseData && Array.isArray(baseData) && baseData[0] && baseData[0].length > 6) {
        totalSteps = baseData[0].length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;
        
        pMercure = baseData[1] ? baseData[1][frameIndex] : null;
        pVenus = baseData[2] ? baseData[2][frameIndex] : null;
        pTerre = baseData[3] ? baseData[3][frameIndex] : null;
        pMars = baseData[4] ? baseData[4][frameIndex] : null;
    } else {
        let dataMercury = data["Mercure - " + methodSuffix] || data["Mercure - Euler"];
        let dataVenus = data["Venus - " + methodSuffix] || data["Venus - Euler"];
        let dataEarth = data["Terre - " + methodSuffix] || data["Terre - Euler"];
        let dataMars = data["Mars - " + methodSuffix] || data["Mars - Euler"];

        if (!dataEarth || !dataEarth[frameIndex]) return;

        totalSteps = dataEarth.length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;

        pMercure = dataMercury ? dataMercury[frameIndex] : null;
        pVenus = dataVenus ? dataVenus[frameIndex] : null;
        pTerre = dataEarth[frameIndex];
        pMars = dataMars ? dataMars[frameIndex] : null;
    }

    if (pMercure) {
        mercuryRawX = pMercure[0][0] / 1e9;
        mercuryRawY = pMercure[0][1] / 1e9;
        trailMercury.push({ x: mercuryRawX, y: mercuryRawY });
        if (trailMercury.length > TRAIL_LENGTH) trailMercury.shift();
        drawPlanet(mercuryRawX * zoom, mercuryRawY * zoom, 8, imgMercure, trailMercury, zoom);
    }

    if (pVenus) {
        venusRawX = pVenus[0][0] / 1e9;
        venusRawY = pVenus[0][1] / 1e9;
        trailVenus.push({ x: venusRawX, y: venusRawY });
        if (trailVenus.length > TRAIL_LENGTH) trailVenus.shift();
        drawPlanet(venusRawX * zoom, venusRawY * zoom, 12, imgVenus, trailVenus, zoom);
    }

    if (pTerre) {
        earthRawX = pTerre[0][0] / 1e9;
        earthRawY = pTerre[0][1] / 1e9;
        trailEarth.push({ x: earthRawX, y: earthRawY });
        if (trailEarth.length > TRAIL_LENGTH) trailEarth.shift();
        drawPlanet(earthRawX * zoom, earthRawY * zoom, 14, imgTerre, trailEarth, zoom);

        let timeSec = pTerre[2];
        let days = floor(timeSec / (24 * 3600));
        timeLabel.html(`Temps: ${days} jours`);

        let ec = pTerre[3];
        let ep = pTerre[4];
        let et = pTerre[5];
        energyHistory.push({ ec, ep, et });
        if (energyHistory.length > MAX_GRAPH_POINTS) energyHistory.shift();
    }

    if (pMars) {
        marsRawX = pMars[0][0] / 1e9;
        marsRawY = pMars[0][1] / 1e9;
        trailMars.push({ x: marsRawX, y: marsRawY });
        if (trailMars.length > TRAIL_LENGTH) trailMars.shift();
        drawPlanet(marsRawX * zoom, marsRawY * zoom, 10, imgMars, trailMars, zoom);
    }
}

function drawPlanet(x, y, size, img, trail, zoom) {
    push();
    noFill();
    stroke(100, 150, 255, 60);
    strokeWeight(1);
    beginShape();
    for (let pt of trail) {
        vertex(pt.x * zoom, pt.y * zoom, 0);
    }
    endShape();
    pop();

    push();
    translate(x, y, 0);
    noStroke();
    if (img) {
        texture(img);
    } else {
        fill(200);
    }
    sphere(size);
    pop();
}

function drawGraphs() {
    if (energyHistory.length === 0) return;
    push();
    resetMatrix();
    translate(-W / 2, -H / 2);

    let gx = 300;
    let gy = H - 150;
    let gw = 300;
    let gh = 120;

    fill(15, 20, 35, 200);
    stroke(77, 166, 255, 100);
    rect(gx, gy, gw, gh, 10);

    noStroke();
    fill(255);
    textSize(12);
    text("Énergies de la Terre (Ec, Ep, Et)", gx + 10, gy + 20);

    let minE = Infinity;
    let maxE = -Infinity;
    for (let e of energyHistory) {
        if (e.ec < minE) minE = e.ec;
        if (e.ep < minE) minE = e.ep;
        if (e.et < minE) minE = e.et;
        if (e.ec > maxE) maxE = e.ec;
        if (e.ep > maxE) maxE = e.ep;
        if (e.et > maxE) maxE = e.et;
    }

    let range = maxE - minE;
    if (range === 0) range = 1;

    strokeWeight(1.5);

    stroke(0, 255, 0);
    noFill();
    beginShape();
    for (let i = 0; i < energyHistory.length; i++) {
        let px = gx + (i / MAX_GRAPH_POINTS) * gw;
        let py = gy + gh - ((energyHistory[i].ec - minE) / range) * gh;
        vertex(px, py);
    }
    endShape();

    stroke(255, 0, 0);
    beginShape();
    for (let i = 0; i < energyHistory.length; i++) {
        let px = gx + (i / MAX_GRAPH_POINTS) * gw;
        let py = gy + gh - ((energyHistory[i].ep - minE) / range) * gh;
        vertex(px, py);
    }
    endShape();

    stroke(255, 255, 0);
    beginShape();
    for (let i = 0; i < energyHistory.length; i++) {
        let px = gx + (i / MAX_GRAPH_POINTS) * gw;
        let py = gy + gh - ((energyHistory[i].et - minE) / range) * gh;
        vertex(px, py);
    }
    endShape();
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    W = windowWidth;
    H = windowHeight;
}