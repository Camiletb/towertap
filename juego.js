// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Crear una escena vacía
var scene = new THREE.Scene();

// Cámara
const aspect = window.innerWidth / window.innerHeight;
const width = 20;
const height = width / aspect;
const camera = new THREE.OrthographicCamera(
    // izq, der, arriba, abajo, plano cercano, plano lejano
    width / -2, 
    width / 2, 
    height / 2, 
    height / -2, 
    1, 
    1000 );
camera.position.set(10, 5, 10);
camera.lookAt(scene.position);

// Configurar el render
var renderer = new THREE.WebGLRenderer({antialias:true}); // Crear con Antialiasing
renderer.setClearColor("#000000"); // Configurar el clear color del render
renderer.setSize( window.innerWidth, window.innerHeight ); // Configurar tamaño del render

// Añadir render al HTML
document.body.appendChild( renderer.domElement );

// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

// Cubo inicial
var geometry = new THREE.BoxGeometry( 3, 0.8, 3 );
var material = new THREE.MeshLambertMaterial( { color: 0xfb8e00 } );
var cube = new THREE.Mesh( geometry, material );
//cube.position.set(0, 0, 0);
//cube.rotateX(10);
//cube.rotateY(Math.PI/4);
scene.add( cube ); // Añadir el cubo a la escena

//Iluminación
const a_light = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente
scene.add(a_light);
const d_light = new THREE.DirectionalLight(0xffffff, 0.6); // Luz direccional
d_light.position.set(10, 20, 0);
scene.add(d_light);

// Render Loop
var render = function () {
  requestAnimationFrame( render );

  //cube.rotation.y += 0.01;

  // Render la escena
  renderer.render(scene, camera);
};

render();