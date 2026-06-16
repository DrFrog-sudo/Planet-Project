for (let name in PLANET_SIZES) {
    planets[name] = { 
        size: PLANET_SIZES[name], 
        raw: { x: 0, y: 0, z: 0 }, 
        trail: new Array(TRAIL_LENGTH),
        trailPointer: 0,
        trailCount: 0 
    };
}

/**
 * @name preload
 * @description Preload function to load JSON data and images before the start.
 */
function preload() {
    data = loadJSON('systeme_solaire.json');
    images.Soleil = loadImage('sunTexture.jpg');
    images.Mercure = loadImage('mercury.jpg');
    images.Venus = loadImage('venus.jpg');
    images.Terre = loadImage('terreTexture.jpg');
    images.Mars = loadImage('mars.jpg');
    images.Jupiter = loadImage('jupiter.jpg');
    images.Saturn = loadImage('saturn.jpg');
    images.Uranus = loadImage('uranus.jpg');
    images.Neptune = loadImage('neptune.jpg');
    images.Halley = loadImage('comet.jpg');
    images.Lune = loadImage('moon.jpg');
}

/**
 * @name applyStyles
 * @description Apply a set of CSS styles to an element.
 * @param el - The element to style.
 * @param styles - The styles to apply.
 */
function applyStyles(el, styles) {
    for (let prop in styles) el.style(prop, styles[prop]);
}

/**
 * @name setup
 * @description Setup function to initialize the sketch.
 */
function setup() {
    createCanvas(W, H, WEBGL);
    document.addEventListener('contextmenu', e => e.preventDefault());

    for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: random(-6000, 6000),
        y: random(-6000, 6000),
        z: random(-6000, 6000),
        b: random(100, 255)
    });
    }

    panel = createDiv('');
    panel.position(5, 5);
    applyStyles(panel, {
        width: '340px',
        'max-height': '90vh',
        overflow: 'auto',
        background: 'rgba(15,20,35,0.92)',
        border: '1px solid rgba(77,166,255,0.5)',
        'border-radius': '15px',
        'backdrop-filter': 'blur(10px)',
        'box-shadow': '0 0 20px rgba(77,166,255,0.3)',
        padding: '15px',
        color: '#fff',
        'font-family': 'sans-serif'
    });

    let title = createDiv('Système Solaire N-Corps');
    title.parent(panel);
    applyStyles(title, { 'font-weight': 'bold', 'font-size': '16px', 'margin-bottom': '15px', color: '#4da6ff' });

    sliderSpeedLabel = createDiv('Vitesse: 1x');
    sliderSpeedLabel.parent(panel);
    sliderSpeed = createSlider(1, 100, 1);
    sliderSpeed.parent(panel);
    applyStyles(sliderSpeed, { width: '100%', 'margin-bottom': '10px' });
    sliderSpeed.input(() => sliderSpeedLabel.html(`Vitesse: ${sliderSpeed.value()}x`));

    timeLabel = createDiv('Temps: 0 jours');
    timeLabel.parent(panel);
    applyStyles(timeLabel, { 'margin-bottom': '15px', 'font-size': '13px' });

    const selectStyle = { width: '100%', padding: '5px', background: '#0f1423', color: '#fff', border: '1px solid #4da6ff', 'border-radius': '5px' };

    methodSelect = createSelect();
    methodSelect.parent(panel);
    applyStyles(methodSelect, selectStyle);

    const planetLabel = createDiv('Planète:');
    planetLabel.parent(panel);
    applyStyles(planetLabel, { 'margin-top': '12px', 'margin-bottom': '6px', 'font-size': '13px', color: '#c5e2ff' });

    planetSelect = createSelect();
    planetSelect.parent(panel);
    applyStyles(planetSelect, selectStyle);
    for (let name of BODY_NAMES.slice(1)) planetSelect.option(name);
    planetSelect.selected(selectedPlanet);

    graphPanel = createDiv('');
    graphPanel.parent(panel);
    applyStyles(graphPanel, { 'margin-top': '12px', display: 'grid', gap: '10px' });

    const graphLabels = ['ΔEc', 'ΔEp', 'ΔEm'];
    for (let label of graphLabels) {
        const wrapper = createDiv('');
        wrapper.parent(graphPanel);
        applyStyles(wrapper, {
            padding: '8px',
            background: 'rgba(8, 12, 18, 0.95)',
            border: '1px solid rgba(77,166,255,0.35)',
            'border-radius': '10px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '5px'
        });

        const gTitle = createDiv(label);
        gTitle.parent(wrapper);
        applyStyles(gTitle, { 'font-size': '12px', 'font-weight': '600', color: '#c5e2ff', margin: '0' });

        const canvas = createElement('canvas');
        canvas.parent(wrapper);
        canvas.attribute('width', '280');
        canvas.attribute('height', '100');
        applyStyles(canvas, { width: '100%', height: '100px', 'border-radius': '8px', background: 'rgba(5, 12, 25, 0.95)', display: 'block' });
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
        for (let name in planets) {
            planets[name].trail = new Array(TRAIL_LENGTH);
            planets[name].trailPointer = 0;
            planets[name].trailCount = 0;
        }
    });

    planetSelect.changed(() => {
        selectedPlanet = planetSelect.value();
        energyHistory = [];
    });
}

/**
 * @name updateCamera
 * @description Update the camera position and orientation based on the selected planet and user interactions.
 */
function updateCamera() {
    let target = (selectedPlanet === 'Soleil' || !planets[selectedPlanet])
        ? { x: camPanX, y: camPanY, z: camTargetZ }
        : planets[selectedPlanet].raw;

    if (selectedPlanet !== 'Soleil' && planets[selectedPlanet]) {
        let shift = camRadius * 202 / H;
        target = {
            x: target.x - cos(camTheta) * shift,
            y: target.y,
            z: target.z + sin(camTheta) * shift
        };
    }

    camPanX = lerp(camPanX, target.x, 0.18);
    camPanY = lerp(camPanY, target.y, 0.18);
    camTargetZ = lerp(camTargetZ, target.z, 0.18);

    let ex = camPanX + camRadius * sin(camTheta) * cos(camPhi);
    let ey = camPanY - camRadius * sin(camPhi);
    let ez = camTargetZ + camRadius * cos(camTheta) * cos(camPhi);
    camera(ex, ey, ez, camPanX, camPanY, camTargetZ, 0, 1, 0);
}


/**
 * @name drawSpaceBackground
 * @description Draw the space background with stars.
 */
function drawSpaceBackground() {
    push();
    stroke(255);
    strokeWeight(0.01);
    beginShape(POINTS);
    for (let star of stars) {
        vertex(star.x, star.y, star.z);
    }
    endShape();
    pop();
}

/**
 * @name draw
 * @description Main draw loop to render the scene.
 */
function draw() {
    background(0);
    updateCamera();
    drawSpaceBackground();
    const zoom = constrain(1000 / camRadius, 0.3, 4);
    updateAndDrawPlanets(zoom);
    drawGraphs();
}
/**
 * @name mouseDragged
 * @description Handle mouse drag events for camera control.
 */
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

/**
 * @name mouseWheel
 * @description Handle mouse wheel events for zoom
 */
function mouseWheel(event) {
    if (mouseX < 350) return false;
    camRadius = constrain(camRadius + event.delta, 50, 10000);
    return false;
}

/**
 * @name mousePressed
 * @description Handle mouse press events for planet selection.
 */
function mousePressed() {
    if (mouseX < 350 || mouseButton !== LEFT) return;

    const zoom = constrain(1000 / camRadius, 0.3, 4);
    let mx = mouseX - W / 2;
    let my = mouseY - H / 2;

    for (let name in planets) {
        let p = planets[name];
        let px = p.raw.x * zoom;
        let py = p.raw.y * zoom;
        let r = p.size * SIZE_FACTOR * zoom;
        if (dist(mx, my, px, py) < r + 15) {
            if (selectedPlanet !== name) {
                selectedPlanet = name;
                if (planetSelect) planetSelect.selected(selectedPlanet);
                energyHistory = [];
            }
            break;
        }
    }
}

/**
 * @name drawSoleil
 * @description Draw the Sun at its current position.
 * @param zoom - The zoom factor for scaling the Sun's size and position.
 */
function drawSoleil(zoom) {
    push();
    translate(sunRawX * zoom, sunRawY * zoom, sunRawZ * zoom);
    noStroke();
    if (images.Soleil && images.Soleil.width > 0) {
        texture(images.Soleil);
    } else {
        fill(255, 200, 0);
    }
    sphere(30 * SIZE_FACTOR * zoom);
    pop();
}

/**
 * name updateAndDrawPlanets
 * @description Update the positions of the planets based on the current frame and draw them.
 * @param zoom - The zoom factor for scaling the planets sizes and positions.
 */
function updateAndDrawPlanets(zoom) {
    if (!data || !selectedMethod) return;

    let methodSuffix = selectedMethod.includes(" - ") ? selectedMethod.split(" - ")[1] : selectedMethod;
    let baseData = data[selectedMethod] || data[methodSuffix];
    let frames;

    if (baseData && Array.isArray(baseData) && baseData[0] && baseData[0].length > 6) {
        frames = baseData;
        totalSteps = frames[0].length;
    } else {
        frames = BODY_NAMES.map(name => {
            let alt = ALT_NAMES[name];
            return data[name + ' - ' + methodSuffix]
                || (alt && data[alt + ' - ' + methodSuffix])
                || data[name + ' - Euler']
                || (alt && data[alt + ' - Euler']);
        });
        if (!frames[3] || !frames[3][frameIndex]) return;
        totalSteps = frames[3].length;
    }

    let step = floor(sliderSpeed.value());
    frameIndex = (frameIndex + step) % totalSteps;

    let pSoleil = frames[0] ? frames[0][frameIndex] : null;
    if (pSoleil) {
        sunRawX = (pSoleil[0][0] / AU_METERS) * DISPLAY_SCALE;
        sunRawY = (pSoleil[0][1] / AU_METERS) * DISPLAY_SCALE;
        sunRawZ = (pSoleil[0][2] / AU_METERS) * DISPLAY_SCALE;
    }

    noLights();
    drawSoleil(zoom);

    ambientLight(35, 35, 45);
    pointLight(255, 255, 255, sunRawX * zoom, sunRawY * zoom, sunRawZ * zoom);

    let activePlanetData = null;

    for (let i = 1; i < BODY_NAMES.length; i++) {
        let name = BODY_NAMES[i];
        let p = planets[name];
        let pData = frames[i] ? frames[i][frameIndex] : null;
        if (!pData) continue;

        let x = (pData[0][0] / AU_METERS) * DISPLAY_SCALE;
        let y = (pData[0][1] / AU_METERS) * DISPLAY_SCALE;
        let z = (pData[0][2] / AU_METERS) * DISPLAY_SCALE;

        if (name === 'Lune') {
            let earth = planets.Terre.raw;
            let factor = 60;
            x = earth.x + (x - earth.x) * factor;
            y = earth.y + (y - earth.y) * factor;
            z = earth.z + (z - earth.z) * factor;
        }

        p.raw.x = x;
        p.raw.y = y;
        p.raw.z = z;
        p.trail[p.trailPointer] = { x, y, z };
        p.trailPointer = (p.trailPointer + 1) % TRAIL_LENGTH;
        if (p.trailCount < TRAIL_LENGTH) p.trailCount++;
        drawPlanet(x * zoom, y * zoom, z * zoom, p.size * SIZE_FACTOR * zoom, images[name], p, zoom, name === selectedPlanet);

        if (name === 'Terre') {
            let timeSec = pData[2];
            let days = floor(timeSec / (24 * 3600));
            timeLabel.html(`Temps: ${days} jours`);
        }

        if (name === selectedPlanet) activePlanetData = pData;
    }

    if (activePlanetData) {
        let ec = activePlanetData[3];
        let ep = activePlanetData[4];
        let et = activePlanetData[5];
        energyHistory.push({ ec, ep, et });
        if (energyHistory.length > MAX_GRAPH_POINTS) energyHistory.shift();
    }
}

/**
 * @name drawPlanet
 * @description Draw a planet at its current position.
 * @param x - The x coordinate of the planet position.
 * @param y - The y coordinate of the planet position.
 * @param z - The z coordinate of the planet position.
 * @param size - The size of the planet.
 * @param img - The texture image for the planet.
 * @param planetObj - The planet object containing its properties.
 * @param zoom - The zoom factor forthe planet size and position.
 * @param isSelected - A boolean indicating if the planet is selected.
 */
function drawPlanet(x, y, z, size, img, planetObj, zoom, isSelected) {
    push();
    noFill();
    stroke(100, 150, 255, 60);
    strokeWeight(1);
    beginShape();
    for (let i = 0; i < planetObj.trailCount; i++) {
        let idx = (planetObj.trailPointer - planetObj.trailCount + i + TRAIL_LENGTH) % TRAIL_LENGTH;
        let pt = planetObj.trail[idx];
        if (pt) vertex(pt.x * zoom, pt.y * zoom, pt.z * zoom);
    }
    
    endShape();
    pop();

    push();
    translate(x, y, z);

    push();
    rotateY(camTheta);
    rotateX(camPhi);
    noFill();
    if (isSelected) {
        stroke(255, 220, 80, 230);
        strokeWeight(2.5);
    } else {
        stroke(120, 200, 255, 150);
        strokeWeight(1.2);
    }
    let ringRadius = size * 1.6 + 4;
    beginShape();
    for (let a = 0; a <= TWO_PI; a += PI / 24) {
        vertex(cos(a) * ringRadius, sin(a) * ringRadius, 0);
    }
    endShape(CLOSE);
    pop();

    noStroke();
    ambientMaterial(255);
    if (img) texture(img); else fill(200);
    sphere(size);
    pop();
}

/**
 * @name drawGraphs
 * @description Draw the energy graphs for the selected planet.
 */
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
            if (e[key] < minE) minE = e[key];
            if (e[key] > maxE) maxE = e[key];
        }

        let range = maxE - minE || 1;
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
            let px = (j / (MAX_GRAPH_POINTS - 1)) * w;
            let py = h - ((energyHistory[j][key] - minE) / range) * h;
            if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
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

/**
 * @name windowResized
 * @description Handle window resize events to adjust the canvas size.
 */
function windowResized() {
    W = window.innerWidth || 1200;
    H = window.innerHeight || 800;
    resizeCanvas(W, H);
}