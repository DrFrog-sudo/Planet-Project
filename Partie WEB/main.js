const SIZE_FACTOR = DISPLAY_SCALE / 149.597;

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
    imgHalley = loadImage('comet.jpg');
    imgMoon = loadImage('moon.jpg');
}

function setup() {
    createCanvas(W, H, WEBGL);

    document.addEventListener('contextmenu', e => e.preventDefault());

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

    const planetLabel = createDiv('Planète:');
    planetLabel.parent(panel);
    planetLabel.style('margin-top', '12px');
    planetLabel.style('margin-bottom', '6px');
    planetLabel.style('font-size', '13px');
    planetLabel.style('color', '#c5e2ff');

    planetSelect = createSelect();
    planetSelect.parent(panel);
    planetSelect.style('width', '100%');
    planetSelect.style('padding', '5px');
    planetSelect.style('background', '#0f1423');
    planetSelect.style('color', '#fff');
    planetSelect.style('border', '1px solid #4da6ff');
    planetSelect.style('border-radius', '5px');
    planetSelect.option('Mercure');
    planetSelect.option('Venus');
    planetSelect.option('Terre');
    planetSelect.option('Mars');
    planetSelect.option('Jupiter');
    planetSelect.option('Saturn');
    planetSelect.option('Uranus');
    planetSelect.option('Neptune');
    planetSelect.option('Halley');
    planetSelect.option('Lune');
    planetSelect.selected(selectedPlanet);

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
        trailHalley = [];
        trailMoon = [];
    });

    planetSelect.changed(() => {
        selectedPlanet = planetSelect.value();
        energyHistory = [];
    });
}

function updateCamera() {
    let targetX = camPanX;
    let targetY = camPanY;
    let targetZ = camTargetZ;

    switch (selectedPlanet) {
        case 'Mercure': targetX = mercuryRawX; targetY = mercuryRawY; targetZ = mercuryRawZ; break;
        case 'Venus': targetX = venusRawX; targetY = venusRawY; targetZ = venusRawZ; break;
        case 'Terre': targetX = earthRawX; targetY = earthRawY; targetZ = earthRawZ; break;
        case 'Mars': targetX = marsRawX; targetY = marsRawY; targetZ = marsRawZ; break;
        case 'Jupiter': targetX = jupiterRawX; targetY = jupiterRawY; targetZ = jupiterRawZ; break;
        case 'Saturn': targetX = saturnRawX; targetY = saturnRawY; targetZ = saturnRawZ; break;
        case 'Uranus': targetX = uranusRawX; targetY = uranusRawY; targetZ = uranusRawZ; break;
        case 'Neptune': targetX = neptuneRawX; targetY = neptuneRawY; targetZ = neptuneRawZ; break;
        case 'Halley': targetX = halleyRawX; targetY = halleyRawY; targetZ = halleyRawZ; break;
        case 'Lune': targetX = moonRawX; targetY = moonRawY; targetZ = moonRawZ; break;
    }

    camPanX = lerp(camPanX, targetX, 0.12);
    camPanY = lerp(camPanY, targetY, 0.12);
    camTargetZ = lerp(camTargetZ, targetZ, 0.12);

    let ex = camPanX + camRadius * sin(camTheta) * cos(camPhi);
    let ey = camPanY - camRadius * sin(camPhi);
    let ez = camTargetZ + camRadius * cos(camTheta) * cos(camPhi);
    camera(ex, ey, ez, camPanX, camPanY, camTargetZ, 0, 1, 0);
}

function draw() {
    background(5, 5, 12);

    const zoom = constrain(1000 / camRadius, 0.3, 4);

    updateCamera();

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
        let speed = 0.008;
        camTheta -= dx * speed;
        camPhi = constrain(camPhi - dy * speed, -PI / 2 + 0.05, PI / 2 - 0.05);
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

    const zoom = constrain(1000 / camRadius, 0.3, 4);
    let mx = mouseX - W / 2;
    let my = mouseY - H / 2;

    let planetsToCheck = [
        { name: 'Mercure', x: mercuryRawX, y: mercuryRawY, r: 8 * SIZE_FACTOR },
        { name: 'Venus', x: venusRawX, y: venusRawY, r: 12 * SIZE_FACTOR },
        { name: 'Terre', x: earthRawX, y: earthRawY, r: 14 * SIZE_FACTOR },
        { name: 'Mars', x: marsRawX, y: marsRawY, r: 10 * SIZE_FACTOR },
        { name: 'Jupiter', x: jupiterRawX, y: jupiterRawY, r: 20 * SIZE_FACTOR },
        { name: 'Saturn', x: saturnRawX, y: saturnRawY, r: 18 * SIZE_FACTOR },
        { name: 'Uranus', x: uranusRawX, y: uranusRawY, r: 16 * SIZE_FACTOR },
        { name: 'Neptune', x: neptuneRawX, y: neptuneRawY, r: 14 * SIZE_FACTOR },
        { name: 'Halley', x: halleyRawX, y: halleyRawY, r: 2 * SIZE_FACTOR },
        { name: 'Lune', x: moonRawX, y: moonRawY, r: 4 * SIZE_FACTOR }
    ];

    for (let p of planetsToCheck) {
        let px = p.x * zoom;
        let py = p.y * zoom;
        let d = dist(mx, my, px, py);
        if (d < (p.r * zoom) + 15) {
            if (selectedPlanet !== p.name) {
                selectedPlanet = p.name;
                if (planetSelect) planetSelect.selected(selectedPlanet);
                energyHistory = [];
            }
            break;
        }
    }
}

function drawSoleil(zoom) {
    push();
    translate(0, 0, 0);
    noStroke();
    if (imgSoleil && imgSoleil.width > 0) {
        texture(imgSoleil);
    } else {
        fill(255, 200, 0);
    }
    sphere(30 * SIZE_FACTOR * zoom);
    pop();
}

function updateAndDrawPlanets(zoom) {
    if (!data || !selectedMethod) return;

    let methodSuffix = selectedMethod.includes(" - ") ? selectedMethod.split(" - ")[1] : selectedMethod;

    let pSoleil, pMercure, pVenus, pTerre, pMars, pJupiter, pSaturn, pUranus, pNeptune, pHalley, pMoon;
    let baseData = data[selectedMethod] || data[methodSuffix];

    if (baseData && Array.isArray(baseData) && baseData[0] && baseData[0].length > 6) {
        totalSteps = baseData[0].length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;

        pSoleil = baseData[0] ? baseData[0][frameIndex] : null;
        pMercure = baseData[1] ? baseData[1][frameIndex] : null;
        pVenus = baseData[2] ? baseData[2][frameIndex] : null;
        pTerre = baseData[3] ? baseData[3][frameIndex] : null;
        pMars = baseData[4] ? baseData[4][frameIndex] : null;
        pJupiter = baseData[5] ? baseData[5][frameIndex] : null;
        pSaturn = baseData[6] ? baseData[6][frameIndex] : null;
        pUranus = baseData[7] ? baseData[7][frameIndex] : null;
        pNeptune = baseData[8] ? baseData[8][frameIndex] : null;
        pHalley = baseData[9] ? baseData[9][frameIndex] : null;
        pMoon = baseData[10] ? baseData[10][frameIndex] : null;
    } else {
        let dataSoleil = data["Soleil - " + methodSuffix] || data["Soleil - Euler"];
        let dataMercury = data["Mercure - " + methodSuffix] || data["Mercure - Euler"];
        let dataVenus = data["Venus - " + methodSuffix] || data["Venus - Euler"];
        let dataEarth = data["Terre - " + methodSuffix] || data["Terre - Euler"];
        let dataMars = data["Mars - " + methodSuffix] || data["Mars - Euler"];
        let dataJupiter = data["Jupiter - " + methodSuffix] || data["Jupiter - Euler"];
        let dataSaturn = data["Saturn - " + methodSuffix] || data["Saturne - " + methodSuffix] || data["Saturn - Euler"] || data["Saturne - Euler"];
        let dataUranus = data["Uranus - " + methodSuffix] || data["Uranus - Euler"];
        let dataNeptune = data["Neptune - " + methodSuffix] || data["Neptune - Euler"];
        let dataHalley = data["Halley - " + methodSuffix] || data["Halley - Euler"];
        let dataMoon = data["Lune - " + methodSuffix] || data["Lune - Euler"] || data["Moon - " + methodSuffix] || data["Moon - Euler"];

        if (!dataEarth || !dataEarth[frameIndex]) return;

        totalSteps = dataEarth.length;
        let step = floor(sliderSpeed.value());
        frameIndex = (frameIndex + step) % totalSteps;

        pSoleil = dataSoleil ? dataSoleil[frameIndex] : null;
        pMercure = dataMercury ? dataMercury[frameIndex] : null;
        pVenus = dataVenus ? dataVenus[frameIndex] : null;
        pTerre = dataEarth[frameIndex];
        pMars = dataMars ? dataMars[frameIndex] : null;
        pJupiter = dataJupiter ? dataJupiter[frameIndex] : null;
        pSaturn = dataSaturn ? dataSaturn[frameIndex] : null;
        pUranus = dataUranus ? dataUranus[frameIndex] : null;
        pNeptune = dataNeptune ? dataNeptune[frameIndex] : null;
        pHalley = dataHalley ? dataHalley[frameIndex] : null;
        pMoon = dataMoon ? dataMoon[frameIndex] : null;
    }

    if (pSoleil) {
        sunRawX = (pSoleil[0][0] / AU_METERS) * DISPLAY_SCALE;
        sunRawY = (pSoleil[0][1] / AU_METERS) * DISPLAY_SCALE;
        sunRawZ = (pSoleil[0][2] / AU_METERS) * DISPLAY_SCALE;
    }

    noLights();
    drawSoleil(sunRawX * zoom, sunRawY * zoom, sunRawZ * zoom, zoom);

    ambientLight(35, 35, 45);
    pointLight(255, 255, 255, sunRawX * zoom, sunRawY * zoom, sunRawZ * zoom);

    if (pMercure) {
        mercuryRawX = (pMercure[0][0] / AU_METERS) * DISPLAY_SCALE;
        mercuryRawY = (pMercure[0][1] / AU_METERS) * DISPLAY_SCALE;
        mercuryRawZ = (pMercure[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailMercury.push({ x: mercuryRawX, y: mercuryRawY, z: mercuryRawZ });
        if (trailMercury.length > TRAIL_LENGTH) trailMercury.shift();
        drawPlanet(mercuryRawX * zoom, mercuryRawY * zoom, mercuryRawZ * zoom, 8 * SIZE_FACTOR * zoom, imgMercure, trailMercury, zoom);
    }
    if (pVenus) {
        venusRawX = (pVenus[0][0] / AU_METERS) * DISPLAY_SCALE;
        venusRawY = (pVenus[0][1] / AU_METERS) * DISPLAY_SCALE;
        venusRawZ = (pVenus[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailVenus.push({ x: venusRawX, y: venusRawY, z: venusRawZ });
        if (trailVenus.length > TRAIL_LENGTH) trailVenus.shift();
        drawPlanet(venusRawX * zoom, venusRawY * zoom, venusRawZ * zoom, 12 * SIZE_FACTOR * zoom, imgVenus, trailVenus, zoom);
    }
    if (pTerre) {
        earthRawX = (pTerre[0][0] / AU_METERS) * DISPLAY_SCALE;
        earthRawY = (pTerre[0][1] / AU_METERS) * DISPLAY_SCALE;
        earthRawZ = (pTerre[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailEarth.push({ x: earthRawX, y: earthRawY, z: earthRawZ });
        if (trailEarth.length > TRAIL_LENGTH) trailEarth.shift();
        drawPlanet(earthRawX * zoom, earthRawY * zoom, earthRawZ * zoom, 14 * SIZE_FACTOR * zoom, imgTerre, trailEarth, zoom);
        let timeSec = pTerre[2];
        let days = floor(timeSec / (24 * 3600));
        timeLabel.html(`Temps: ${days} jours`);
    }
    if (pMars) {
        marsRawX = (pMars[0][0] / AU_METERS) * DISPLAY_SCALE;
        marsRawY = (pMars[0][1] / AU_METERS) * DISPLAY_SCALE;
        marsRawZ = (pMars[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailMars.push({ x: marsRawX, y: marsRawY, z: marsRawZ });
        if (trailMars.length > TRAIL_LENGTH) trailMars.shift();
        drawPlanet(marsRawX * zoom, marsRawY * zoom, marsRawZ * zoom, 10 * SIZE_FACTOR * zoom, imgMars, trailMars, zoom);
    }
    if (pJupiter) {
        jupiterRawX = (pJupiter[0][0] / AU_METERS) * DISPLAY_SCALE;
        jupiterRawY = (pJupiter[0][1] / AU_METERS) * DISPLAY_SCALE;
        jupiterRawZ = (pJupiter[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailJupiter.push({ x: jupiterRawX, y: jupiterRawY, z: jupiterRawZ });
        if (trailJupiter.length > TRAIL_LENGTH) trailJupiter.shift();
        drawPlanet(jupiterRawX * zoom, jupiterRawY * zoom, jupiterRawZ * zoom, 20 * SIZE_FACTOR * zoom, imgJupiter, trailJupiter, zoom);
    }
    if (pSaturn) {
        saturnRawX = (pSaturn[0][0] / AU_METERS) * DISPLAY_SCALE;
        saturnRawY = (pSaturn[0][1] / AU_METERS) * DISPLAY_SCALE;
        saturnRawZ = (pSaturn[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailSaturn.push({ x: saturnRawX, y: saturnRawY, z: saturnRawZ });
        if (trailSaturn.length > TRAIL_LENGTH) trailSaturn.shift();
        drawPlanet(saturnRawX * zoom, saturnRawY * zoom, saturnRawZ * zoom, 18 * SIZE_FACTOR * zoom, imgSaturn, trailSaturn, zoom);
    }
    if (pUranus) {
        uranusRawX = (pUranus[0][0] / AU_METERS) * DISPLAY_SCALE;
        uranusRawY = (pUranus[0][1] / AU_METERS) * DISPLAY_SCALE;
        uranusRawZ = (pUranus[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailUranus.push({ x: uranusRawX, y: uranusRawY, z: uranusRawZ });
        if (trailUranus.length > TRAIL_LENGTH) trailUranus.shift();
        drawPlanet(uranusRawX * zoom, uranusRawY * zoom, uranusRawZ * zoom, 16 * SIZE_FACTOR * zoom, imgUranus, trailUranus, zoom);
    }
    if (pNeptune) {
        neptuneRawX = (pNeptune[0][0] / AU_METERS) * DISPLAY_SCALE;
        neptuneRawY = (pNeptune[0][1] / AU_METERS) * DISPLAY_SCALE;
        neptuneRawZ = (pNeptune[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailNeptune.push({ x: neptuneRawX, y: neptuneRawY, z: neptuneRawZ });
        if (trailNeptune.length > TRAIL_LENGTH) trailNeptune.shift();
        drawPlanet(neptuneRawX * zoom, neptuneRawY * zoom, neptuneRawZ * zoom, 14 * SIZE_FACTOR * zoom, imgNeptune, trailNeptune, zoom);
    }
    if (pHalley) {
        halleyRawX = (pHalley[0][0] / AU_METERS) * DISPLAY_SCALE;
        halleyRawY = (pHalley[0][1] / AU_METERS) * DISPLAY_SCALE;
        halleyRawZ = (pHalley[0][2] / AU_METERS) * DISPLAY_SCALE;
        trailHalley.push({ x: halleyRawX, y: halleyRawY, z: halleyRawZ });
        if (trailHalley.length > TRAIL_LENGTH) trailHalley.shift();
        drawPlanet(halleyRawX * zoom, halleyRawY * zoom, halleyRawZ * zoom, 2 * SIZE_FACTOR * zoom, imgHalley, trailHalley, zoom);
    }
    if (pMoon) {
        let mx = (pMoon[0][0] / AU_METERS) * DISPLAY_SCALE;
        let my = (pMoon[0][1] / AU_METERS) * DISPLAY_SCALE;
        let mz = (pMoon[0][2] / AU_METERS) * DISPLAY_SCALE;

        // Exagération artificielle de la distance pour éviter que la lune soit cachée DANS la Terre
        let factor = 60;
        moonRawX = earthRawX + (mx - earthRawX) * factor;
        moonRawY = earthRawY + (my - earthRawY) * factor;
        moonRawZ = earthRawZ + (mz - earthRawZ) * factor;

        trailMoon.push({ x: moonRawX, y: moonRawY, z: moonRawZ });
        if (trailMoon.length > TRAIL_LENGTH) trailMoon.shift();
        drawPlanet(moonRawX * zoom, moonRawY * zoom, moonRawZ * zoom, 4 * SIZE_FACTOR * zoom, imgMoon, trailMoon, zoom);
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
    else if (selectedPlanet === 'Halley') activePlanetData = pHalley;
    else if (selectedPlanet === 'Lune') activePlanetData = pMoon;

    if (activePlanetData) {
        let ec = activePlanetData[3];
        let ep = activePlanetData[4];
        let et = activePlanetData[5];
        energyHistory.push({ ec, ep, et });
        if (energyHistory.length > MAX_GRAPH_POINTS) energyHistory.shift();
    }
}

function drawPlanet(x, y, z, size, img, trail, zoom) {
    push();
    noFill();
    stroke(100, 150, 255, 60);
    strokeWeight(1);
    beginShape();
    for (let pt of trail) {
        vertex(pt.x * zoom, pt.y * zoom, pt.z * zoom);
    }
    endShape();
    pop();

    push();
    translate(x, y, z);
    noStroke();
    ambientMaterial(255);
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
            box = ctx.lineTo(px, py);
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
    W = window.innerWidth || 1200;
    H = window.innerHeight || 800;
    resizeCanvas(W, H);
}