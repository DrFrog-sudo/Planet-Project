const W = 1200;
const H = 800;
const TRAIL_LENGTH = 50000;
const MAX_GRAPH_POINTS = 200;

let stars = [];
let data;
let trail = [];
let frameIndex = 0;
let totalSteps = 0;
let earthRawX = 0;
let earthRawY = 0;

let sliderSpeed, sliderSpeedLabel, timeLabel;
let sliderZoom, sliderZoomLabel;
let methodSelect;

let offsetX = 0;
let offsetY = 0;
let selectedPlanet = 'Terre';
let selectedMethod = '';
let energyHistory = [];