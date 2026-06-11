function preload() {
    data = loadJSON('terre.json');
    imgSoleil = loadImage('sunTexture.jpg');
    imgTerre = loadImage('terreTexture.jpg');
    imgVenus = loadImage('venus.jpg');
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

    sliderSpeed = createSlider(1, 961, 1, 24);
    sliderSpeed.parent(panel);
    sliderSpeed.position(15, 15);
    sliderSpeed.style('width', '250px');
    sliderSpeed.style('accent-color', '#4da6ff');

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

    sliderZoom = createSlider(5, 50, 25, 1);
    sliderZoom.parent(panel);
    sliderZoom.position(15, 95);
    sliderZoom.style('width', '250px');
    sliderZoom.style('accent-color', '#4da6ff');

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
    methodSelect.style('outline', 'none');

    methodSelect.changed(() => {
        selectedMethod = methodSelect.value();
        frameIndex = 0;
        trailEarth = [];
        trailVenus = [];
        trailMars = [];
        energyHistory = [];
        totalSteps = 0;
        earthRawX = 0; earthRawY = 0;
        venusRawX = 0; venusRawY = 0;
        marsRawX = 0; marsRawY = 0;
    });

    if (data) {
        let methodKeys = Object.keys(data).filter(key => /euler|rk4/i.test(key));
        if (methodKeys.length === 0) methodKeys = Object.keys(data);

        for (let key of methodKeys) {
            let label = key.replace(/Terre\s*-\s*/i, '').replace(/Euler Asym/i, 'Euler asymétrique');
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
        { name: 'Terre', x: earthRawX, y: earthRawY, r: 14 },
        { name: 'Venus', x: venusRawX, y: venusRawY, r: 13 },
        { name: 'Mars', x: marsRawX, y: marsRawY, r: 10 }
    ];

    for (let p of planetsToCheck) {
        let ex = p.x * zoom;
        let ey = p.y * zoom;
        let r = p.r * zoom;
        if (dist(mx, my, ex, ey) < r + 15) {
            selectedPlanet = (selectedPlanet === p.name) ? null : p.name;
            return;
        }
    }

    if (dist(mx, my, 0, 0) < 28 * zoom) {
        selectedPlanet = null;
    }
}

function windowResized() {
    W = windowWidth;
    H = windowHeight;
    resizeCanvas(W, H);
}