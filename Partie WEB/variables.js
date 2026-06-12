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

let trailMercury = [];
let trailVenus = [];
let trailEarth = [];
let trailMars = [];

let sliderSpeed, sliderSpeedLabel, timeLabel;
let sliderZoom, sliderZoomLabel;
let methodSelect;
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