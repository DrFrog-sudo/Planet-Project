function preload() {
    data = loadJSON('terre.json');
}

function setup() {
    createCanvas(W, H);

    // Initialisation des étoiles de fond
    for (let i = 0; i < 300; i++) {
        stars.push({ x: random(W), y: random(H), size: random(1, 3), brightness: random(150, 255) });
    }

    // Paramétrage des Sliders d'interface
    sliderSpeed = createSlider(1, 961, 1, 24);
    sliderSpeed.position(10, 10).style('width', '240px');
    sliderSpeedLabel = createP('').position(10, 35).style('color', 'white').style('font-size', '14px');
    timeLabel = createP('').position(10, 60).style('color', 'white').style('font-size', '14px');

    sliderZoom = createSlider(5, 50, 50, 1);
    sliderZoom.position(10, 90).style('width', '240px');
    sliderZoomLabel = createP('').position(10, 115).style('color', 'white').style('font-size', '14px');

    // Menu déroulant de choix de méthode de calcul
    createP('Méthode :').position(10, 120).style('color', 'white').style('font-size', '14px').style('margin', '0');
    methodSelect = createSelect();
    methodSelect.position(10, 145).style('width', '240px');
    
    methodSelect.changed(() => {
        selectedMethod = methodSelect.value();
        // Reset de la simulation lors du changement d'algorithme
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