// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------
//Globales de three.js
let camera, scene, renderer;
let pila = [];
const hBox = 0.8;
const initBoxSize = 3;

//Contadores y auxiliares
let levelCont = 1;

init();
function init(){
  scene = new THREE.Scene(); // Crear una escena vacía
  
  //
  // Primer nivel
  addNivel(0, 0, initBoxSize, initBoxSize);
  addNivel(-10, 0, initBoxSize, initBoxSize, 1);

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
      1000 );
  camera.position.set(10, 5, 10);
  camera.lookAt(scene.position);

  //Iluminación
  const a_light = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente
  scene.add(a_light);
  const d_light = new THREE.DirectionalLight(0xffffff, 0.6); // Luz direccional
  d_light.position.set(10, 20, 0);
  scene.add(d_light);

  // Configurar el render
  renderer = new THREE.WebGLRenderer({antialias:true}); // Crear con Antialiasing
  renderer.setClearColor("#000000"); // Configurar el clear color del render
  renderer.setSize( window.innerWidth, window.innerHeight ); // Configurar tamaño del render
  //renderer.shadowMap.enabled = true; // Habilitar sombra
  document.body.appendChild( renderer.domElement ); // Añadir render al HTML
}


// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

function addNivel(x, z, width, depth, n){
  const y = pila.length * hBox; // Posición de la nueva capa
  const nivel = createCube(x, y, z, width, depth);

  if(levelCont % 2 == 0)
    nivel.direction = "z";
  else
    nivel.direction = "x";
  levelCont++;

  pila.push(nivel);
}


createCube();
function createCube(x, y, z, width, depth) {

  // Cubo
  //var geometry = new THREE.BoxGeometry( initBoxSize, hBox, initBoxSize );
  var geometry, material, cube;
  geometry = new THREE.BoxGeometry( width, hBox, depth );
  if(pila.length % 2 == 0)
    material = new THREE.MeshLambertMaterial( { color: 0xfb8e00 } );
  else
    material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
  cube = new THREE.Mesh( geometry, material );
  cube.position.set(x, y, z);
  //cube.position.set(0, 0, 0);
  //cube.rotateX(10);
  //cube.rotateY(Math.PI/4);
  scene.add( cube ); // Añadir el cubo a la escena

  return {
    threejs: cube,
    width,
    depth
  };
}
  

// Render Loop
var render = function () {
  requestAnimationFrame( render );

  //cube.rotation.y += 0.01;    

  // Render la escena
  renderer.render(scene, camera);
};
render();

// ------------------------------------------------
// FUN ENDS HERE (LISTENERS STARTS HERE)
// ------------------------------------------------
let started = false;
window.addEventListener("click", () =>{ 
  if(!started){
    //renderer.setAnimationLoop(animation);
    //Usamos setAnimationLoop porque setAnimationFrame sólo se
    //ejecuta una vez, y necesitamos que la animación se ejecute en bucle
    started = true;
  }else{
    if(pila.length > 0){
      const nivel = pila.pop();
      scene.remove(nivel.threejs);
      if(nivel.direction == "z"){
        addNivel(0, 0, nivel.width, nivel.depth);
      }else{
        addNivel(0, 0, nivel.depth, nivel.width);
      }
  }
}
});

//Resetear el juego
window.addEventListener("keydown", (e) => {
  if(e.key == "r"){
    location.reload();
    scene.remove(pila[0].threejs);
    pila = [];
    levelCont = 1;

    addNivel(0, 0, initBoxSize, initBoxSize);
    addNivel(-10, 0, initBoxSize, initBoxSize, 1);
}
});

function animation(){
  const speed = 0.015;
  const head = pila[pila.length - 1]; //elemento más alto de la pila
  /*Vamos a cambiar la posición del cubo superior (head) en
  el eje head.direction (x o z, en función de si es un nivel
  par o impar) */
  head.position[head.direction] += speed;
}