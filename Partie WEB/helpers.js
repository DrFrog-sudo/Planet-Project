// --- Formateurs de texte ---

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

// --- Fonctions de rendu graphique ---

function drawStars() {
    noStroke();
    for (const { x, y, size, brightness } of stars) {
        fill(brightness);
        circle(x, y, size);
    }
}

function drawSoleil() {
    noStroke();
    const zoomFactor = sliderZoom.value() / 10;
    fill(255, 220, 0, 40);  circle(W / 2 + offsetX, H / 2 + offsetY, 80 * zoomFactor);
    fill(255, 180, 0);      circle(W / 2 + offsetX, H / 2 + offsetY, 50 * zoomFactor);
    fill(255, 150, 0);      circle(W / 2 + offsetX, H / 2 + offsetY, 30 * zoomFactor);
    fill(255, 120, 0);      circle(W / 2 + offsetX, H / 2 + offsetY, 20 * zoomFactor);
    fill(255, 100, 0);      circle(W / 2 + offsetX, H / 2 + offsetY, 10 * zoomFactor);
    fill(255, 80, 0);       circle(W / 2 + offsetX, H / 2 + offsetY, 5 * zoomFactor);
    fill(255, 60, 0);       circle(W / 2 + offsetX, H / 2 + offsetY, 3 * zoomFactor);
    fill(255, 40, 0);       circle(W / 2 + offsetX, H / 2 + offsetY, 2 * zoomFactor);
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

    frameIndex = (frameIndex + advanceBy) % trajectory.length;

    if (!trajectory[frameIndex] || !trajectory[0]) return;

    const [px, py] = trajectory[frameIndex][0];
    earthRawX = px / 500_000_000;
    earthRawY = py / 500_000_000;

    let currentEc = trajectory[frameIndex][3];
    let currentEp = trajectory[frameIndex][4];
    let currentEm = trajectory[frameIndex][5];

    let initEc = trajectory[0][3];
    let initEp = trajectory[0][4];
    let initEm = trajectory[0][5];

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
        for (const { x, y } of trail) {
            vertex(x * zoom + W / 2 + offsetX, y * zoom + H / 2 + offsetY);
        }
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
    let totalWidth = 3 * gW + 40; 
    let startX = (W - totalWidth) / 2;
    let xStarts = [startX, startX + gW + 20, startX + 2 * (gW + 20)];
    
    let keys = ['dEc', 'dEp', 'dEm'];
    let titles = ['ΔEc', 'ΔEp', 'ΔEm']; 
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
        }

        noStroke();
        fill(240);
        textSize(12);
        textStyle(BOLD);
        textAlign(LEFT, TOP);
        text(titles[i], xStart + 10, yStart + 8);

        noFill();
        stroke(colors[i]);
        strokeWeight(2); 
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