//Taille de la fenetre
let W = window.innerWidth || 1200;
let H = window.innerHeight || 800;
let panel;

//Les constantes
const TRAIL_LENGTH = 500;
const MAX_GRAPH_POINTS = 200;
const AU_METERS = 149.597e9;
const DISPLAY_SCALE = 80;
const JSON_SAMPLE_STRIDE = 10;


//Constante pour des planetes visibles mais pas trop grosses
const SIZE_FACTOR = DISPLAY_SCALE / 149.597;

//Fond etoilé
let stars = [];
const STAR_COUNT = 5000;

//Constantes pour les calculs sur les planetes
const BODY_NAMES = ['Soleil', 'Mercure', 'Venus', 'Terre', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Halley', 'Lune'];

//Au cas ou mauvaise comprehension avec le C
const ALT_NAMES = { Saturn: 'Saturne', Lune: 'Moon' };

//Taille des planetes
const PLANET_SIZES = { Mercure: 4, Venus: 6, Terre: 7, Mars: 5, Jupiter: 10, Saturn: 9, Uranus: 8, Neptune: 7, Halley: 1, Lune: 2 };



let rawData;
let data;
let frameIndex = 0;
let totalSteps = 0;

//Variables pour les positions des planetes
let mercuryRawX = 0, mercuryRawY = 0, mercuryRawZ = 0;
let venusRawX = 0, venusRawY = 0, venusRawZ = 0;
let earthRawX = 0, earthRawY = 0, earthRawZ = 0;
let marsRawX = 0, marsRawY = 0, marsRawZ = 0;
let jupiterRawX = 0, jupiterRawY = 0, jupiterRawZ = 0;
let saturnRawX = 0, saturnRawY = 0, saturnRawZ = 0;
let uranusRawX = 0, uranusRawY = 0, uranusRawZ = 0;
let neptuneRawX = 0, neptuneRawY = 0, neptuneRawZ = 0;
let halleyRawX = 0, halleyRawY = 0, halleyRawZ = 0;
let moonRawX = 0, moonRawY = 0, moonRawZ = 0;


//Variables pour les trainees.
let trailMercury = [];
let trailVenus = [];
let trailEarth = [];
let trailMars = [];
let trailJupiter = [];
let trailSaturn = [];
let trailUranus = [];
let trailNeptune = [];
let trailHalley = [];
let trailMoon = [];


//Variables pour le menu
let sliderSpeed, sliderSpeedLabel, timeLabel;
let methodSelect;
let planetSelect;
let graphPanel;
let graphCanvases = [];
let graphContexts = [];
let selectedPlanet = 'Terre';
let selectedMethod = '';
let energyHistory = [];

//Images pour les textures des planetes
let imgSoleil, imgMercure, imgVenus, imgTerre;
let imgMars, imgJupiter, imgSaturn, imgUranus, imgNeptune;
let imgHalley, imgMoon;

//Variables pour la camera.
let camTheta = 0;
let camPhi = 0.3;
let camRadius = 1000;
let camPanX = 0;
let camPanY = 0;
let camTargetZ = 0;