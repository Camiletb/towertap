// -------------------------------------------------------------------------- //
// BASIC SETUP                                                                //
// -------------------------------------------------------------------------- //

// Globales de three.js
let camera, scene, renderer;
let pila = [];  // Pila que contiene los bloques
let colgajo;
const hBox = 0.6; // Altura del bloque
const initBoxSize = 6;  // Tamaño inicial del bloque
const hCamera = 3;  // Posición inicial de la cámara

let BoxSize = [initBoxSize, initBoxSize]; // Array de tamaños de cajas
let nuevoCentro = [];

// Globales de tweens.js
var tweens;

// Variables de GLTFLoader
const loader = new THREE.GLTFLoader();
var root;
var shrekBool = false;
var shrekTtl = 6000;

// Contadores y auxiliares
let levelCont = 1;
let encima = false;
let lose = false;
let end = false;
var boolCubo = true;
var boolColgajo = false;

// Elementos DOM
const divLevel = document.getElementById("nivel");
const divReglas = document.getElementById("reglas");

// Instrucciones
let ins = "Con 'R' reseteas la partida. Pero por ninguna razón pulses 'X'.";


init();

/* -------------------------------------------------------------------------- */
/* Función init(): inicializa las variables del juego, setea la luz, escena,  */
/* cámara y render, y crea los objetos que se van a usar.                     */
/* -------------------------------------------------------------------------- */
function init() {
  end = false;
  scene = new THREE.Scene(); // Crear una escena vacía

  // Primer nivel
  addNivel(0, 0, initBoxSize, initBoxSize);
  addNivel(-10, 0, initBoxSize, initBoxSize, "x");

  // Cámara
  const aspect = window.innerWidth / window.innerHeight;
  const width = 20;
  const height = width / aspect;
  camera = new THREE.OrthographicCamera(
      // izq, der, arriba, abajo, plano cercano, plano lejano
      width / -2, 
      width / 2, 
      height / 2, 
      height / -2, 
      1, 
      1000);
  camera.position.set(10, 3*hBox + hCamera, 10);
  camera.lookAt(scene.position);  

  // Iluminación
  const a_light = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente
  scene.add(a_light);
  const d_light = new THREE.DirectionalLight(0xffffff, 0.6); // Luz direccional
  d_light.position.set(10, 20, 0);
  scene.add(d_light);

  // Configurar el render
  renderer = new THREE.WebGLRenderer({antialias:true}); // Crear con Antialiasing
  renderer.setClearColor("#000000"); // Configurar el clear color del render
  renderer.setSize(window.innerWidth, window.innerHeight); // Configurar tamaño del render
  renderer.shadowMap.enabled = true; // Habilitar sombra
  //renderer.setAnimationLoop(animation);
  document.body.appendChild( renderer.domElement ); // Añadir render al HTML
}


// -------------------------------------------------------------------------- //
// GAME FUNCTIONS                                                             //
// -------------------------------------------------------------------------- //

/* -------------------------------------------------------------------------- */
/* Función addNivel(): crea un nuevo bloque y lo añade a la pila de niveles.  */
/* -------------------------------------------------------------------------- */
function addNivel (x, z, width, depth, direction, color) {
  var y;
  var nivel;

  if (boolCubo) {
    y = pila.length * hBox; // Posición de la nueva capa
    nivel = createCube(x, y, z, width, depth, color);
    levelCont++;
    nivel.direction = direction;
    nivel.width = width;
    nivel.depth = depth;
    pila.push(nivel); // Añadir el nivel a la pila
    divLevel.innerText = pila.length - 1;
  }
  else {
    y = (pila.length - 1) * hBox; // Posición y del colgajo
    colgajo = createCube(x, y, z, width, depth, color);
    colgajo.direction = direction;
    colgajo.width = width;
    colgajo.depth = depth;
  }
}

/* -------------------------------------------------------------------------- */
/* Función createCube(): crea un nuevo bloque y lo devuelve a él mismo y      */
/* sus dimensiones.                                                           */
/* -------------------------------------------------------------------------- */
createCube();
function createCube(x, y, z, width, depth, colorb) {
  // Cubo
  var geometry, material, cube;
  geometry = new THREE.BoxGeometry( width, hBox, depth );
  const color = new THREE.Color(`hsl(${1 + pila.length * 10}, 50%, 50%)`);
  //const colortorre = new THREE.Color(`hsl(${30 + pila.length * 4}, 100%, 50%)`);
  if (colorb == 4) {
    material = new THREE.MeshLambertMaterial({color: 0xffffff});
  }
  else
    material = new THREE.MeshLambertMaterial({color});
    //material = new THREE.MeshLambertMaterial({color: 0xfb8e00 + pila.length * 0x000020});

  cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  //cube.position.set(0, 0, 0);
  //cube.rotateX(10);
  //cube.rotateY(Math.PI/4);

  scene.add(cube); // Añadir el cubo a la escena

  return {
    threejs: cube,
    width,
    depth
  };
}
  

/* -------------------------------------------------------------------------- */
/* Render loop                                                                */
/* -------------------------------------------------------------------------- */
var render = function () {
  requestAnimationFrame(render);

  //cube.rotation.y += 0.01;    
  //renderer.setAnimationLoop(animation);
  // if(!started)
  //   animation();

  if (!end) {
    //and NotLose
    const head = pila[pila.length - 1];
    //pila.forEach(function(cube){
    if (head.direction == "z") {
      head.threejs.position.z += 0.15;
    }
    if (head.direction == "x") {
      head.threejs.position.x += 0.15;
    }

    let prev = pila[pila.length - 2];
    var aux1prev = [prev.threejs.position.x - prev.width, prev.threejs.position.x + prev.width]; // auxiliar para comprobar si el bloque actual está encima del extremo anterior del bloque anterior
    var aux2prev = [prev.threejs.position.z - prev.depth, prev.threejs.position.z + prev.depth]; // auxiliar para comprobar si el bloque actual está encima del extremo posterior del bloque anterior

    if(head.threejs.position.x > aux1prev[1])
      fin();
    if(head.threejs.position.z > aux2prev[1])
      fin();

      
    if (boolColgajo)
      colgajo.threejs.position.y -= 0.1;

    TWEEN.update();
    updateCamera();
  }

  // Render de la escena
  renderer.render(scene, camera);
};

render();

// -------------------------------------------------------------------------- //
// LISTENERS                                                                  //
// -------------------------------------------------------------------------- //
let jugando = true;
//window.addEventListener("touchstart", manejador);
window.addEventListener("click", manejador);

function manejador() {
  if (!jugando) {
    divReglas.style.visibility = "show";
    //renderer.setAnimationLoop(animation);
    //Usamos setAnimationLoop porque setAnimationFrame sólo se
    //ejecuta una vez, y necesitamos que la animación se ejecute en bucle
    jugando = true;
  }
  else {
    divReglas.innerText = ins;
    const head = pila[pila.length - 1];
    const prev = pila[pila.length - 2];
    var dir = head.direction;
    const siguienteX = dir == "x" ? 0 : -10; // Si es x, 0, si es z, -10
    const siguienteZ = dir == "z" ? 0 : -10; // Si es z, 0, si es x, -10
    nuevoCentro = [siguienteX, siguienteZ];
    if(pila.length > 0){
        const nuevasMedidas = [];

      // Comprobamos si el último bloque está encima del bloque anterior
      const xhead = [head.threejs.position.x - head.width/2, head.threejs.position.x + head.width/2];
      const zhead = [head.threejs.position.z - head.depth/2, head.threejs.position.z + head.depth/2];
      const xprev = [prev.threejs.position.x - prev.width/2, prev.threejs.position.x + prev.width/2];
      const zprev = [prev.threejs.position.z - prev.depth/2, prev.threejs.position.z + prev.depth/2];
      const aux1prev = [prev.threejs.position.x - prev.width, prev.threejs.position.x + prev.width]; // auxiliar para comprobar si el bloque actual está encima del extremo anterior del bloque anterior
      const aux2prev = [prev.threejs.position.z - prev.depth, prev.threejs.position.z + prev.depth]; // auxiliar para comprobar si el bloque actual está encima del extremo posterior del bloque anterior
      
      if(head.threejs.position.x > aux1prev[1])
        fin();

      if (head.direction == "x") {
        if (head.threejs.position.x > aux1prev[0] &&
          head.threejs.position.x < aux1prev[1]) { // Si está encima
            encima = true;
            cortar(xhead, xprev);
        }
        else{          
          //Game Over
          //gestión de derrota
          fin(); 
        } 
      }

      if(head.direction == "z"){
        if(head.threejs.position.z > aux2prev[0] &&
          head.threejs.position.z < aux2prev[1]) { // Si está encima
            encima = true;
            cortar(zhead, zprev);
        }
        else {
          //Game Over
          //gestión de derrota
          fin();
        }
      }

      //const nivel = pila.pop();
      //scene.remove(nivel.threejs);
      // const head = pila[pila.length - 1];

      if(!lose){
        dir = head.direction;
        //Next level
        //posición inicial

        const siguienteDir = dir == "x" ? "z" : "x";
        const nWidth = BoxSize[0]; // Se cambiará por los futuros tamaños
        const nDepth = BoxSize[1];

        //nuevoCentro = (siguienteX, siguienteZ);
        encima = false;
        //addNivel(siguienteX, siguienteZ, nWidth, nDepth, siguienteDir);
        const next = addNivel(nuevoCentro[0], nuevoCentro[1], nWidth, nDepth, siguienteDir);
      }
    }
  }
}

// Conservar la parte del bloque que coincide con el anterior
function cortar(headExtremos, prevExtremos){
    const head = pila[pila.length - 1];
    const prev = pila[pila.length - 2];
    
    //const p0 = prevExtremos[0];
    let p0 = 0;
    let p1 = 0;
    const prevSize = prevExtremos[1] - prevExtremos[0];
    const headSize = headExtremos[1] - headExtremos[0];
    const dist = prevExtremos[1] - headExtremos[1];
    //const newSize = headSize - dist; // widthprev - distancia entre prevPP[1] y headPP[0] = nuevo width/depth
    let newSize = 0;

    let delta;

    if (head.direction == "x") {
      delta = head.threejs.position.x - prev.threejs.position.x;
    }
    else {
      delta = head.threejs.position.z - prev.threejs.position.z;
    }
    
    let colgajo = Math.abs(delta);
    let overlap = headSize - colgajo;
    
    if (overlap > 0) { // cortar
      newSize = overlap;
      if (head.direction == "x") {
        BoxSize[0] = newSize;
        if (delta < 0)
          nuevoCentro[0] = prevExtremos[0] + newSize/2;
        else
          nuevoCentro[0] = prevExtremos[1] - newSize/2;

        splitHead(head, headExtremos, delta, newSize, 1);
      }
      else {
        BoxSize[1] = newSize;
        if (delta < 0)
          nuevoCentro[1] = prevExtremos[0] + newSize/2;
        else
          nuevoCentro[1] = prevExtremos[1] - newSize/2;

        splitHead(head, headExtremos, delta, newSize, 0);
      }
    }
}

function splitHead(head, headExtremos, delta, newSize, direccion) {
  let p0 = headExtremos[0];
  let p1 = headExtremos[1];
  let colgajo = Math.abs(delta);
  let newPos;
  let posColgajo;

  if (delta >= 0) {
    newPos = headExtremos[0] + newSize/2;
    posColgajo = headExtremos[1] - colgajo/2;
  }
  else {
    newPos = headExtremos[1] - newSize/2;
    posColgajo = headExtremos[0] + colgajo/2;
  }
  
  pila.pop();
  scene.remove(head.threejs);

  if (direccion) { // viene de X
    // Resize head
    addNivel(newPos, head.threejs.position.z, newSize, BoxSize[1], head.direction, 3);
    // Create colgajo
    boolCubo = false;
    boolColgajo = true;
    addNivel(posColgajo, head.threejs.position.z, colgajo, BoxSize[1], head.direction, 4);
    boolCubo = true;
  }
  else { // viene de X
    // Resize head
    addNivel(head.threejs.position.x, newPos, BoxSize[0], newSize, head.direction, 3);
    // Create colgajo
    boolCubo = false;
    boolColgajo = true;
    addNivel(head.threejs.position.x, posColgajo, BoxSize[0], colgajo, head.direction, 4);
    boolCubo = true;
  }
}


//Resetear el juego
window.addEventListener("keydown", (e) => {
  if(e.key == "r" || e.key == "R")
    reset();
  if(e.key == "x" || e.key == "X"){
    divReglas.innerText = "Oye. Eso era una 'X'!";
    ins = "Desobediente y sin ninguna vergüenza. Me gusta. Con 'Z' puedes volver a las instrucciones.";
    if (!shrekBool) {
      _LoadAnimatedModel();
      shrekBool = true;
    }
  }
  if(e.key == "z" || e.key == "Z"){
    divReglas.innerText = "Ah, pues no.";
    ins = "Soy una torre malvada, pero no mucho, con 'i' puedes revisar las instrucciones.";
  }
  if(e.key == "i" || e.key == "I"){
    divReglas.innerText = "Tómalas, aunque no creo que las necesites. Sólo buscabas conversar conmigo.";
    ins = "Con 'R' reseteas la partida. Con click colocas tu bloque.";
  }
  
});

function fin(){
  divReglas.innerText = "Perdiste, la verdad, no te voy a mentir. Pulsa R, anda, que nos echamos otra.";
  //gestión de derrota
  //reset();
  lose = true;
          jugando = false;
  end = true;
  camera.position.set(0, 10*pila.length*hBox, 0);
  camera.lookAt(scene.position);  
}

function reset(){
  location.reload();
  scene.remove(pila[0].threejs);
  pila = [];
  levelCont = 1;

  addNivel(0, 0, initBoxSize, initBoxSize);
  addNivel(-10, 0, initBoxSize, initBoxSize, "x");
}

function animation(){
  const speed = 0.05;
  const head = pila[pila.length - 1]; //elemento más alto de la pila
  /*Vamos a cambiar la posición del cubo superior (head) en
  el eje head.direction (x o z, en función de si es un nivel
  par o impar) */
  head.position[head.direction] += speed;
  renderer.render(scene, camera);
  //updateCamera();
}

function updateCamera(){
  /*Vamos a cambiar la posición de la cámara en función del
  nivel más alto de la pila:

  Si la posición de la cámara es menor que la suma de la posición
  inicial (hCamera.y) y el incremento de h que le corresponde
  al nivel más alto de la pila, es decir, si la cámara no se ha acabado de 
  desplazar, seguimos moviendo la cámara.
  */
 
  if(camera.position.y < hBox * (pila.length+1) + hCamera)
    camera.position.y += 0.05;

    //camera.position.set(10, hCamera + levelCont * hBox, 10);
    //camera.position.set(camera.position.x, hBox * pila.length + hCamera, camera.position.z);

  renderer.render(scene, camera);
}

function _LoadAnimatedModel() {
  // Loader
  loader.load('model/scene.gltf', function(gltf) {
    root = gltf.scene;
    root.name = "shrek";
    root.position.y = pila.length * hBox;
    root.scale.set(1.5, 1.5, 1.5);

    mixer = new THREE.AnimationMixer(root);
    mixer.clipAction(gltf.animations[0]).play();

    scene.add(root);
    animate();
  }, function(xhr){console.log((xhr.loaded/xhr.total * 100) + "% loaded");},
     function(error){console.log("Error: " + error);});
}

function animate() {
  requestAnimationFrame(animate);

  var shrek = scene.getObjectByName("shrek");

  var target = {x: shrek.rotation.x, y: shrek.rotation.y + 150 * Math.PI, z: shrek.rotation.z};
  var rotation = shrek.rotation;
  var tween = new TWEEN.Tween(rotation).to(target, shrekTtl);
  tween.easing(TWEEN.Easing.Bounce.Out);
  tween.start();

  tween.onComplete(function(){
		shrekBool = false;
    scene.remove(root);
	});

  renderer.render(scene, camera);
}
