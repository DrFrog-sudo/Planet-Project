function preload() {
    data = loadJSON('systeme_solaire.json');
    imgSoleil = loadImage('sunTexture.jpg');
    imgMercure = loadImage('mercury.jpg');
    imgVenus = loadImage('venus.jpg');
    imgTerre = loadImage('terreTexture.jpg');
    imgMars = loadImage('mars.jpg');
    imgJupiter = loadImage('jupiter.jpg');
    imgSaturn = loadImage('saturn.jpg');
    imgUranus = loadImage('uranus.jpg');
    imgNeptune = loadImage('neptune.jpg');
}

function setup() {
    W = windowWidth;
    H = windowHeight;
    createCanvas(W, H, WEBGL);

    document.addEventListener('contextmenu', e => e.preventDefault());

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
    panel.style('width', '340px');
    panel.style('max-height', '90vh');
    panel.style('overflow', 'auto');
    panel.style('background', 'rgba(15,20,35,0.92)');
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

    graphPanel = createDiv('');
    graphPanel.parent(panel);
    graphPanel.style('margin-top', '12px');
    graphPanel.style('display', 'grid');
    graphPanel.style('gap', '10px');

    const graphLabels = ['ΔEc', 'ΔEp', 'ΔEm'];
    for (let label of graphLabels) {
        const wrapper = createDiv('');
        wrapper.parent(graphPanel);
        wrapper.style('padding', '8px');
        wrapper.style('background', 'rgba(8, 12, 18, 0.95)');
        wrapper.style('border', '1px solid rgba(77,166,255,0.35)');
        wrapper.style('border-radius', '10px');
        wrapper.style('display', 'flex');
        wrapper.style('flex-direction', 'column');
        wrapper.style('gap', '5px');

        const title = createDiv(label);
        title.parent(wrapper);
        title.style('font-size', '12px');
        title.style('font-weight', '600');
        title.style('color', '#c5e2ff');
        title.style('margin', '0');

        const canvas = createElement('canvas');
        canvas.parent(wrapper);
        canvas.attribute('width', '280');
        canvas.attribute('height', '100');
        canvas.style('width', '100%');
        canvas.style('height', '100px');
        canvas.style('border-radius', '8px');
        canvas.style('background', 'rgba(5, 12, 25, 0.95)');
        canvas.style('display', 'block');
        graphCanvases.push(canvas);
        graphContexts.push(canvas.elt.getContext('2d'));
    }

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
        trailJupiter = [];
        trailSaturn = [];
        trailUranus = [];
        trailNeptune = [];
    });
}

function updateCamera() {
    let ex = camPanX + camRadius * sin(camTheta) * cos(camPhi);
    let ey = camPanY - camRadius * sin(camPhi);
    let ez = camRadius * cos(camTheta) * cos(camPhi);
    camera(ex, ey, ez, camPanX, camPanY, 0, 0, 1, 0);
}

function draw() {
    background(5, 5, 12);

    const zoom = sliderZoom.value() / 10;
    sliderZoomLabel.html(`Zoom: ${zoom.toFixed(1)}x`);

    updateCamera();

    drawStars();
    drawSoleil(zoom);
    updateAndDrawPlanets(zoom);
    drawGraphs();
}

function mouseDragged() {
    if (mouseX < 350) return;
    let dx = mouseX - pmouseX;
    let dy = mouseY - pmouseY;

    if (mouseButton === LEFT) {
        let speed = camRadius * 0.002;
        camPanX -= dx * speed;
        camPanY -= dy * speed;
    } else if (mouseButton === RIGHT) {
        camTheta -= dx * 0.008;
        camPhi = constrain(camPhi - dy * 0.008, -PI / 2 + 0.05, PI / 2 - 0.05);
    }
}

function mouseWheel(event) {
    if (mouseX < 350) return false;
    camRadius = constrain(camRadius + event.delta, 50, 10000);
    return false;
}

function mousePressed() {
    if (mouseX < 350) return;
    if (mouseButton !== LEFT) return;

    const zoom = sliderZoom.value() / 10;
    let mx = mouseX - W / 2;
    let my = mouseY - H / 2;

    let planetsToCheck = [
        { name: 'Mercure', x: mercuryRawX, y: mercuryRawY, r: 8 },
        { name: 'Venus', x: venusRawX, y: venusRawY, r: 12 },
        { name: 'Terre', x: earthRawX, y: earthRawY, r: 14 },
        { name: 'Mars', x: marsRawX, y: marsRawY, r: 10 },
        { name: 'Jupiter', x: jupiterRawX, y: jupiterRawY, r: 20 },
        { name: 'Saturn', x: saturnRawX, y: saturnRawY, r: 18 },
        { name: 'Uranus', x: uranusRawX, y: uranusRawY, r: 16 },
        { name: 'Neptune', x: neptuneRawX, y: neptuneRawY, r: 16 }
    ];

    for (let p of planetsToCheck) {
        let px = p.x * zoom;
        let py = p.y * zoom;
        let d = dist(mx, my, px, py);
        if (d < (p.r * zoom) + 15) {
            if (selectedPlanet !== p.name) {
                selectedPlanet = p.name;
                energyHistory = [];
            }
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
    sphere(30 * zoom);
    pop();
}

function updateAndDrawPlanets(zoom) {
    if (!data || !selectedMethod) return;

    let methodSuffix = selectedMethod.includes(" - ") ? selectedMethod.split(" - ")[1] : selectedMethod;

    let pMercure, pVenus, pTerre, pMars, pJupiter, pSaturn, pUranus, pNeptune;
    let baseData = data[selectedMethod] || data[methodSuffix];

    if (baseData && Array.isArray(baseData) && baseData[0] && baseData[0].length > 6) {
        totalSteps = baseData[0].length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;

        pMercure = baseData[1] ? baseData[1][frameIndex] : null;
        pVenus = baseData[2] ? baseData[2][frameIndex] : null;
        pTerre = baseData[3] ? baseData[3][frameIndex] : null;
        pMars = baseData[4] ? baseData[4][frameIndex] : null;
        pJupiter = baseData[5] ? baseData[5][frameIndex] : null;
        pSaturn = baseData[6] ? baseData[6][frameIndex] : null;
        pUranus = baseData[7] ? baseData[7][frameIndex] : null;
        pNeptune = baseData[8] ? baseData[8][frameIndex] : null;
    } else {
        let dataMercury = data["Mercure - " + methodSuffix] || data["Mercure - Euler"];
        let dataVenus = data["Venus - " + methodSuffix] || data["Venus - Euler"];
        let dataEarth = data["Terre - " + methodSuffix] || data["Terre - Euler"];
        let dataMars = data["Mars - " + methodSuffix] || data["Mars - Euler"];
        let dataJupiter = data["Jupiter - " + methodSuffix] || data["Jupiter - Euler"];
        let dataSaturn = data["Saturn - " + methodSuffix] || data["Saturn - Euler"];
        let dataUranus = data["Uranus - " + methodSuffix] || data["Uranus - Euler"];
        let dataNeptune = data["Neptune - " + methodSuffix] || data["Neptune - Euler"];

        if (!dataEarth || !dataEarth[frameIndex]) return;

        totalSteps = dataEarth.length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;

        pMercure = dataMercury ? dataMercury[frameIndex] : null;
        pVenus = dataVenus ? dataVenus[frameIndex] : null;
        pTerre = dataEarth[frameIndex];
        pMars = dataMars ? dataMars[frameIndex] : null;
        pJupiter = dataJupiter ? dataJupiter[frameIndex] : null;
        pSaturn = dataSaturn ? dataSaturn[frameIndex] : null;
        pUranus = dataUranus ? dataUranus[frameIndex] : null;
        pNeptune = dataNeptune ? dataNeptune[frameIndex] : null;
    }

    if (pMercure) {
        mercuryRawX = pMercure[0][0] / 1e9;
        mercuryRawY = pMercure[0][1] / 1e9;
        trailMercury.push({ x: mercuryRawX, y: mercuryRawY });
        if (trailMercury.length > TRAIL_LENGTH) trailMercury.shift();
        drawPlanet(mercuryRawX * zoom, mercuryRawY * zoom, 8 * zoom, imgMercure, trailMercury, zoom);
    }
    if (pVenus) {
        venusRawX = pVenus[0][0] / 1e9;
        venusRawY = pVenus[0][1] / 1e9;
        trailVenus.push({ x: venusRawX, y: venusRawY });
        if (trailVenus.length > TRAIL_LENGTH) trailVenus.shift();
        drawPlanet(venusRawX * zoom, venusRawY * zoom, 12 * zoom, imgVenus, trailVenus, zoom);
    }
    if (pTerre) {
        earthRawX = pTerre[0][0] / 1e9;
        earthRawY = pTerre[0][1] / 1e9;
        trailEarth.push({ x: earthRawX, y: earthRawY });
        if (trailEarth.length > TRAIL_LENGTH) trailEarth.shift();
        drawPlanet(earthRawX * zoom, earthRawY * zoom, 14 * zoom, imgTerre, trailEarth, zoom);
        let timeSec = pTerre[2];
        let days = floor(timeSec / (24 * 3600));
        timeLabel.html(`Temps: ${days} jours`);
    }
    if (pMars) {
        marsRawX = pMars[0][0] / 1e9;
        marsRawY = pMars[0][1] / 1e9;
        trailMars.push({ x: marsRawX, y: marsRawY });
        if (trailMars.length > TRAIL_LENGTH) trailMars.shift();
        drawPlanet(marsRawX * zoom, marsRawY * zoom, 10 * zoom, imgMars, trailMars, zoom);
    }
    if (pJupiter) {
        jupiterRawX = pJupiter[0][0] / 1e9;
        jupiterRawY = pJupiter[0][1] / 1e9;
        trailJupiter.push({ x: jupiterRawX, y: jupiterRawY });
        if (trailJupiter.length > TRAIL_LENGTH) trailJupiter.shift();
        drawPlanet(jupiterRawX * zoom, jupiterRawY * zoom, 20 * zoom, imgJupiter, trailJupiter, zoom);
    }
    if (pSaturn) {
        saturnRawX = pSaturn[0][0] / 1e9;
        saturnRawY = pSaturn[0][1] / 1e9;
        trailSaturn.push({ x: saturnRawX, y: saturnRawY });
        if (trailSaturn.length > TRAIL_LENGTH) trailSaturn.shift();
        drawPlanet(saturnRawX * zoom, saturnRawY * zoom, 18 * zoom, imgSaturn, trailSaturn, zoom);
    }
    if (pUranus) {
        uranusRawX = pUranus[0][0] / 1e9;
        uranusRawY = pUranus[0][1] / 1e9;
        trailUranus.push({ x: uranusRawX, y: uranusRawY });
        if (trailUranus.length > TRAIL_LENGTH) trailUranus.shift();
        drawPlanet(uranusRawX * zoom, uranusRawY * zoom, 16 * zoom, imgUranus, trailUranus, zoom);
    }
    if (pNeptune) {
        neptuneRawX = pNeptune[0][0] / 1e9;
        neptuneRawY = pNeptune[0][1] / 1e9;
        trailNeptune.push({ x: neptuneRawX, y: neptuneRawY });
        if (trailNeptune.length > TRAIL_LENGTH) trailNeptune.shift();
        drawPlanet(neptuneRawX * zoom, neptuneRawY * zoom, 14 * zoom, imgNeptune, trailNeptune, zoom);
    }

    let activePlanetData = null;
    if (selectedPlanet === 'Mercure') activePlanetData = pMercure;
    else if (selectedPlanet === 'Venus') activePlanetData = pVenus;
    else if (selectedPlanet === 'Terre') activePlanetData = pTerre;
    else if (selectedPlanet === 'Mars') activePlanetData = pMars;
    else if (selectedPlanet === 'Jupiter') activePlanetData = pJupiter;
    else if (selectedPlanet === 'Saturn') activePlanetData = pSaturn;
    else if (selectedPlanet === 'Uranus') activePlanetData = pUranus;
    else if (selectedPlanet === 'Neptune') activePlanetData = pNeptune;

    if (activePlanetData) {
        let ec = activePlanetData[3];
        let ep = activePlanetData[4];
        let et = activePlanetData[5];
        energyHistory.push({ ec, ep, et });
        if (energyHistory.length > MAX_GRAPH_POINTS) energyHistory.shift();
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
    if (!energyHistory || energyHistory.length === 0) return;

    const w = 280;
    const h = 100;
    const keys = ['ec', 'ep', 'et'];
    const colors = ['#00ff00', '#ff0000', '#ffff00'];

    for (let i = 0; i < 3; i++) {
        const ctx = graphContexts[i];
        if (!ctx) continue;

        const key = keys[i];
        ctx.clearRect(0, 0, w, h);

        let minE = Infinity;
        let maxE = -Infinity;
        for (let e of energyHistory) {
            let val = e[key];
            if (val < minE) minE = val;
            if (val > maxE) maxE = val;
        }

        let range = maxE - minE;
        if (range === 0) range = 1;

        minE -= range * 0.1;
        maxE += range * 0.1;
        range = maxE - minE;

        if (minE < 0 && maxE > 0) {
            let zeroY = h - ((0 - minE) / range) * h;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, zeroY);
            ctx.lineTo(w, zeroY);
            ctx.stroke();
        }

        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let j = 0; j < energyHistory.length; j++) {
            let val = energyHistory[j][key];
            let px = (j / (MAX_GRAPH_POINTS - 1)) * w;
            let py = h - ((val - minE) / range) * h;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(77, 166, 255, 0.6)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(selectedPlanet.toUpperCase(), 8, 6);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(maxE.toExponential(2), w - 5, 4);
        ctx.textBaseline = 'bottom';
        ctx.fillText(minE.toExponential(2), w - 5, h - 4);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    W = windowWidth;
    H = windowHeight;
}