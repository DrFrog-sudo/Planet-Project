function preload() {
    data = loadJSON('terre.json');
}

function setup() {
    W = windowWidth;
    H = windowHeight;
    createCanvas(W, H);

    for (let i = 0; i < 300; i++) {
        stars.push({
            x: random(W),
            y: random(H),
            size: random(1, 3),
            brightness: random(150, 255)
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

    sliderSpeed = createSlider(1, 961, 1, 24);
    sliderSpeed.parent(panel);
    sliderSpeed.position(15, 15);
    sliderSpeed.style('width', '250px');
    sliderSpeed.style('accent-color', '#4da6ff');
    sliderSpeed.style('cursor', 'pointer');

    sliderSpeedLabel = createP('');
    sliderSpeedLabel.parent(panel);
    sliderSpeedLabel.position(15, 40);
    sliderSpeedLabel.style('color', '#ffffff');
    sliderSpeedLabel.style('font-size', '14px');
    sliderSpeedLabel.style('font-family', 'Arial');
    sliderSpeedLabel.style('margin', '0');

    timeLabel = createP('');
    timeLabel.parent(panel);
    timeLabel.position(15, 65);
    timeLabel.style('color', '#cccccc');
    timeLabel.style('font-size', '14px');
    timeLabel.style('font-family', 'Arial');
    timeLabel.style('margin', '0');

    sliderZoom = createSlider(5, 50, 50, 1);
    sliderZoom.parent(panel);
    sliderZoom.position(15, 95);
    sliderZoom.style('width', '250px');
    sliderZoom.style('accent-color', '#4da6ff');
    sliderZoom.style('cursor', 'pointer');

    sliderZoomLabel = createP('');
    sliderZoomLabel.parent(panel);
    sliderZoomLabel.position(15, 120);
    sliderZoomLabel.style('color', '#ffffff');
    sliderZoomLabel.style('font-size', '14px');
    sliderZoomLabel.style('font-family', 'Arial');
    sliderZoomLabel.style('margin', '0');

    let methodLabel = createP('Méthode de calcul');
    methodLabel.parent(panel);
    methodLabel.position(15, 150);
    methodLabel.style('color', '#ffffff');
    methodLabel.style('font-size', '15px');
    methodLabel.style('font-weight', 'bold');
    methodLabel.style('font-family', 'Arial');
    methodLabel.style('margin', '0');

    methodSelect = createSelect();
    methodSelect.parent(panel);
    methodSelect.position(15, 180);
    methodSelect.style('width', '250px');
    methodSelect.style('padding', '8px');
    methodSelect.style('border-radius', '8px');
    methodSelect.style('border', '2px solid #4da6ff');
    methodSelect.style('background', '#1a1f2e');
    methodSelect.style('color', 'white');
    methodSelect.style('font-size', '14px');
    methodSelect.style('font-family', 'Arial');
    methodSelect.style('outline', 'none');
    methodSelect.style('cursor', 'pointer');

    methodSelect.changed(() => {
        selectedMethod = methodSelect.value();
        frameIndex = 0;
        trail = [];
        energyHistory = [];
        totalSteps = 0;
        earthRawX = 0;
        earthRawY = 0;
    });

    if (data) {
        let methodKeys = Object.keys(data).filter(key => /euler|rk4/i.test(key));
        if (methodKeys.length === 0) methodKeys = Object.keys(data);

        for (let key of methodKeys) {
            let label = key.replace(/Terre\s*-\s*/i, '')
                           .replace(/Euler Asym/i, 'Euler asymétrique');
            methodSelect.option(label, key);
        }

        selectedMethod = methodKeys.length ? methodKeys[0] : '';
        methodSelect.selected(selectedMethod);
    }
}

function draw() {
    background(5, 5, 12);

    const zoom = sliderZoom.value() / 10;
    sliderZoomLabel.html(`Zoom: ${zoom.toFixed(1)}x`);

    // Appels des modules de rendu graphique (définis dans helpers.js)
    drawStars();
    drawSoleil();
    drawTerre(zoom);
    drawGraphs();
}

// --- Gestion des Interactions Souris ---

function mousePressed() {
    // Évite de déclencher la sélection si on clique sur la zone de contrôle de l'UI
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
    // Permet le déplacement de la caméra (Pan)
    if (mouseX > 260 || mouseY > 150) {
        offsetX += mouseX - pmouseX;
        offsetY += mouseY - pmouseY;
    }
}

function windowResized() {
    W = windowWidth;
    H = windowHeight;
    resizeCanvas(W, H);

    // regenerate stars to fill the viewport
    stars = [];
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: random(W),
            y: random(H),
            size: random(1, 3),
            brightness: random(150, 255)
        });
    }

    if (panel) {
        panel.position(5, 5);
        const panelW = Math.min(280, W * 0.28);
        panel.size(panelW, 240);
        if (sliderSpeed) sliderSpeed.style('width', (panelW - 30) + 'px');
        if (sliderZoom) sliderZoom.style('width', (panelW - 30) + 'px');
        if (methodSelect) methodSelect.style('width', (panelW - 30) + 'px');
    }
}