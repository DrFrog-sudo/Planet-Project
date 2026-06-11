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
    push();
    noStroke();
    fill(255);
    for (const s of stars) {
        push();
        translate(s.x, s.y, s.z);
        box(s.size);
        pop();
    }
    pop();
}

function drawSoleil(zoomFactor) {
    push();
    translate(0, 0, 0);
    rotateY(frameCount * 0.002);
    noStroke();
    if (imgSoleil) {
        texture(imgSoleil);
    } else {
        fill(255, 230, 0);
    }
    sphere(28 * zoomFactor);
    pop();
}

function updateAndDrawPlanets(zoom) {
    let baseKey = selectedMethod || Object.keys(data)[0];
    if (!baseKey || !data[baseKey]) return;

    let trajectoryEarth = data[baseKey];
    
    let keyVenus = baseKey.replace(/Terre/i, 'Venus');
    let keyMars = baseKey.replace(/Terre/i, 'Mars');

    let trajectoryVenus = data[keyVenus] || trajectoryEarth;
    let trajectoryMars = data[keyMars] || trajectoryEarth;

    const sampleInterval = trajectoryEarth.length > 1
        ? Math.max(1, Math.round(trajectoryEarth[1][2] - trajectoryEarth[0][2]))
        : 60;

    const speedFactor = sliderSpeed.value();
    const advanceBy = Math.max(1, Math.round((speedFactor * 3600) / sampleInterval));

    sliderSpeedLabel.html(`Speed: ${formatSpeed(speedFactor)} per frame`);

    let maxTrailPoints = TRAIL_LENGTH / ((speedFactor * 3600) / sampleInterval);
    if (maxTrailPoints < 2) maxTrailPoints = 2;

    if (earthRawX !== 0 || earthRawY !== 0) {
        trailEarth.push({ x: earthRawX, y: earthRawY });
        while (trailEarth.length > maxTrailPoints) trailEarth.shift();
    }
    if (venusRawX !== 0 || venusRawY !== 0) {
        trailVenus.push({ x: venusRawX, y: venusRawY });
        while (trailVenus.length > maxTrailPoints) trailVenus.shift();
    }
    if (marsRawX !== 0 || marsRawY !== 0) {
        trailMars.push({ x: marsRawX, y: marsRawY });
        while (trailMars.length > maxTrailPoints) trailMars.shift();
    }

    frameIndex = (frameIndex + advanceBy) % trajectoryEarth.length;

    if (!trajectoryEarth[frameIndex] || !trajectoryEarth[0]) return;

    earthRawX = trajectoryEarth[frameIndex][0][0] / 500_000_000;
    earthRawY = trajectoryEarth[frameIndex][0][1] / 500_000_000;


    if (data[keyVenus] && data[keyVenus][frameIndex]) {
        venusRawX = data[keyVenus][frameIndex][0][0] / 500_000_000;
        venusRawY = data[keyVenus][frameIndex][0][1] / 500_000_000;
    } else {
        venusRawX = earthRawX * 0.7;
        venusRawY = earthRawY * 0.7;
    }

    if (data[keyMars] && data[keyMars][frameIndex]) {
        marsRawX = data[keyMars][frameIndex][0][0] / 500_000_000;
        marsRawY = data[keyMars][frameIndex][0][1] / 500_000_000;
    } else {
        marsRawX = earthRawX * 1.5;
        marsRawY = earthRawY * 1.5;
    }

    let activeTrajectory = trajectoryEarth;
    if (selectedPlanet === 'Venus') activeTrajectory = trajectoryVenus;
    if (selectedPlanet === 'Mars') activeTrajectory = trajectoryMars;

    if (activeTrajectory && activeTrajectory[frameIndex] && activeTrajectory[0]) {
        let deltaEc = activeTrajectory[frameIndex][3] - activeTrajectory[0][3];
        let deltaEp = activeTrajectory[frameIndex][4] - activeTrajectory[0][4];
        let deltaEm = activeTrajectory[frameIndex][5] - activeTrajectory[0][5];

        energyHistory.push({ dEc: deltaEc, dEp: deltaEp, dEm: deltaEm });
        while (energyHistory.length > MAX_GRAPH_POINTS) {
            energyHistory.shift();
        }
    }

    drawPlanetWithTrail(earthRawX, earthRawY, 14, imgTerre, trailEarth, [0, 140, 255], 0.015, zoom);
    drawPlanetWithTrail(venusRawX, venusRawY, 13, imgVenus, trailVenus, [220, 180, 120], 0.005, zoom);
    drawPlanetWithTrail(marsRawX, marsRawY, 10, imgMars, trailMars, [255, 100, 50], 0.012, zoom);

    totalSteps += advanceBy;
    timeLabel.html(`Elapsed: ${formatElapsed(totalSteps * sampleInterval / 3600)}`);
}

function drawPlanetWithTrail(rx, ry, radius, img, trailArray, fallbackColor, rotSpeed, zoom) {
    if (trailArray.length > 1) {
        push();
        noFill();
        stroke(fallbackColor[0], fallbackColor[1], fallbackColor[2], 140);
        strokeWeight(1.5);
        beginShape();
        for (const pt of trailArray) {
            vertex(pt.x * zoom, pt.y * zoom, 0);
        }
        endShape();
        pop();
    }

    push();
    translate(rx * zoom, ry * zoom, 0);
    rotateY(frameCount * rotSpeed);
    noStroke();
    if (img) {
        texture(img);
    } else {
        fill(fallbackColor[0], fallbackColor[1], fallbackColor[2]);
    }
    sphere(radius * zoom);
    pop();
}

function drawGraphs() {
    if (!selectedPlanet || energyHistory.length < 2) return;

    push();
    resetMatrix();
    camera(0, 0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
    translate(-W / 2, -H / 2, 0); 

    let gW = 240;
    let gH = 110;
    let padding = 20;
    let xStart = W - gW - padding; 
    let totalHeight = 3 * gH + 2 * padding;
    let yStart = (H - totalHeight) / 2;
    
    let keys = ['dEc', 'dEp', 'dEm'];
    let titles = [`ΔEc (${selectedPlanet})`, `ΔEp (${selectedPlanet})`, `ΔEm (${selectedPlanet})`]; 
    let colors = [[255, 75, 75], [75, 255, 75], [255, 255, 75]];

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
        let currentY = yStart + i * (gH + padding);
        let key = keys[i];

        fill(15, 20, 35, 230);
        stroke(0, 120, 255, 100);
        strokeWeight(1.5);
        rect(xStart, currentY, gW, gH, 12);

        let yZero = map(0, globalMin, globalMax, currentY + gH - 15, currentY + 30);
        if (isFinite(yZero) && yZero > currentY + 30 && yZero < currentY + gH - 15) {
            stroke(255, 255, 255, 50);
            strokeWeight(1);
            line(xStart + 15, yZero, xStart + gW - 15, yZero);
        }

        noStroke();
        fill(240);
        textSize(11);
        textAlign(LEFT, TOP);
        text(titles[i], xStart + 15, currentY + 10);

        noFill();
        stroke(colors[i][0], colors[i][1], colors[i][2]);
        strokeWeight(2);
        beginShape();
        for (let j = 0; j < energyHistory.length; j++) {
            let vx = map(j, 0, energyHistory.length - 1, xStart + 15, xStart + gW - 15);
            let vy = map(energyHistory[j][key], globalMin, globalMax, currentY + gH - 15, currentY + 30);
            if (isFinite(vx) && isFinite(vy)) {
                vertex(vx, vy, 0);
            }
        }
        endShape();
    }
    pop();
}