let W = window.innerWidth || 1200;
let H = window.innerHeight || 800;
let panel;
const TRAIL_LENGTH = 500;
const MAX_GRAPH_POINTS = 200;

let stars = [];
let data;
let frameIndex = 0;
let totalSteps = 0;

let mercuryRawX = 0, mercuryRawY = 0;
let venusRawX = 0, venusRawY = 0;
let earthRawX = 0, earthRawY = 0;
let marsRawX = 0, marsRawY = 0;
let jupiterRawX = 0, jupiterRawY = 0;
let saturnRawX = 0, saturnRawY = 0;
let uranusRawX = 0, uranusRawY = 0;
let neptuneRawX = 0, neptuneRawY = 0;

let trailMercury = [];
let trailVenus = [];
let trailEarth = [];
let trailMars = [];
let trailJupiter = [];
let trailSaturn = [];
let trailUranus = [];
let trailNeptune = [];

let sliderSpeed, sliderSpeedLabel, timeLabel;
let sliderZoom, sliderZoomLabel;
let methodSelect;
let graphPanel;
let graphCanvases = [];
let graphContexts = [];
let offsetX = 0;
let offsetY = 0;
let selectedPlanet = 'Terre';
let selectedMethod = '';
let energyHistory = [];

let imgSoleil;
let imgMercure;
let imgVenus;
let imgTerre;
let imgMars;
let imgJupiter;
let imgSaturn;
let imgUranus;
let imgNeptune;