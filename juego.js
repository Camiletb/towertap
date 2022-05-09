// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------
//Globales de three.js
let camera, scene, renderer;
let pila = [];
const hBox = 1;
const initBoxSize = 5;
const hCamera = 5; // posición inicial de la cámara

let BoxSize = [initBoxSize, initBoxSize]; // Array de tamaños de cajas
let nuevoCentro = [-10, 0];
//Contadores y auxiliares
let levelCont = 1;
let encima = false;
let lose = false;
let end = false;

init();
function init(){
  end = false;
  scene = new THREE.Scene(); // Crear una escena vacía
  
  //
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
      1000 );
  camera.position.set(10, 3*hBox + hCamera, 10);
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
  renderer.shadowMap.enabled = true; // Habilitar sombra
  //renderer.setAnimationLoop(animation);
  document.body.appendChild( renderer.domElement ); // Añadir render al HTML
}


// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

function addNivel(x, z, width, depth, direction){
  const y = pila.length * hBox; // Posición de la nueva capa
  const nivel = createCube(x, y, z, width, depth);
  //const direc;
  levelCont++;
  nivel.direction = direction;
  nivel.width = width;
  nivel.depth = depth;
  // if(levelCont % 2 == 0)
  //   nivel.direction = "z";
  // else
  //   nivel.direction = "x";

  pila.push(nivel); // Añadir el nivel a la pila
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
  //renderer.setAnimationLoop(animation);
  // if(!started)
  //   animation();

  if(!end){
    //and NotLose
    const head = pila[pila.length - 1];
    //pila.forEach(function(cube){
      if(head.direction == "z"){
        head.threejs.position.z += 0.05;
      }
      if(head.direction == "x"){
        head.threejs.position.x += 0.05;
      }
      updateCamera();
    //});
  }

  //if
  // Render la escena
  renderer.render(scene, camera);
};

render();

// ------------------------------------------------
// FUN ENDS HERE (LISTENERS STARTS HERE)
// ------------------------------------------------
let jugando = true;
//window.addEventListener("mousedown", manejador);
//window.addEventListener("touchstart", manejador);
window.addEventListener("click", manejador);

function manejador(){
  if(!jugando){
    //renderer.setAnimationLoop(animation);
    //Usamos setAnimationLoop porque setAnimationFrame sólo se
    //ejecuta una vez, y necesitamos que la animación se ejecute en bucle
    jugando = true;
  }else{
    if(pila.length > 0){
        const nuevasMedidas = [];
      console.log("Click! Bloque número: ", pila.length, ".");

      // Comprobamos si el último bloque está encima del bloque anterior
      const head = pila[pila.length - 1];
      const prev = pila[pila.length - 2];
      const xhead = [head.threejs.position.x - head.width/2, head.threejs.position.x + head.width/2];
      const zhead = [head.threejs.position.z - head.depth/2, head.threejs.position.z + head.depth/2];
      const xprev = [prev.threejs.position.x - prev.width/2, prev.threejs.position.x + prev.width/2];
      const zprev = [prev.threejs.position.z - prev.depth/2, prev.threejs.position.z + prev.depth/2];
      const aux1prev = [prev.threejs.position.x - prev.width, prev.threejs.position.x + prev.width]; // auxiliar para comprobar si el bloque actual está encima del extremo anterior del bloque anterior
      const aux2prev = [prev.threejs.position.z - prev.depth, prev.threejs.position.z + prev.depth]; // auxiliar para comprobar si el bloque actual está encima del extremo posterior del bloque anterior
      if(head.direction == "x"){
        if(head.threejs.position.x > aux1prev[0] &&
           head.threejs.position.x < aux2prev[1]){ // Si está encima
          console.log("Encima!");
          encima = true;
          cortar(xhead, xprev);
        }else{
          console.log("No encima!");
          //Game Over
          //gestión de derrota
          fin(); 
        } 
      }
      if(head.direction == "z"){
        if(head.threejs.position.z > aux1prev[0] &&
           head.threejs.position.z < aux2prev[1]){ // Si está encima
          console.log("Encima!");
          encima = true;
          cortar(zhead, zprev);
        }else{
          console.log("No encima!");
          //Game Over
          //gestión de derrota
          fin();
        }
      }

      //const nivel = pila.pop();
      //scene.remove(nivel.threejs);
      // const head = pila[pila.length - 1];
      if(!lose){
        const dir = head.direction;

        //Next level
        //posición inicial
        const siguienteX = dir == "x" ? 0 : -10; // Si es x, 0, si es z, -10
        const siguienteZ = dir == "z" ? 0 : -10; // Si es z, 0, si es x, -10
        const siguienteDir = dir == "x" ? "z" : "x";
        const nWidth = BoxSize[0]; // Se cambiará por los futuros tamaños
        const nDepth = BoxSize[1];

        //nuevoCentro = (siguienteX, siguienteZ);
        encima = false;
        //addNivel(siguienteX, siguienteZ, nWidth, nDepth, siguienteDir);
        console.log("Las dimensiones del cubo van a ser", nWidth," x ", nDepth);
        addNivel(siguienteX, siguienteZ, nWidth, nDepth, siguienteDir);
      }
      // if(nivel.direction == "z"){
      //   addNivel(0, 0, nivel.width, nivel.depth);
      // }else{
      //   addNivel(0, 0, nivel.depth, nivel.width);
      // }
      // addNivel(0, 0, nivel.width, nivel.depth);
      // addNivel(0, 0, nivel.depth, nivel.width);
    }
  }
}
// Conservar la parte del bloque que coincide con el anterior
function cortar(headExtremos, prevExtremos){
    const head = pila[pila.length - 1];
    const prev = pila[pila.length - 2];
    
    //const restWidth = prev.width - (head.threejs.position.x - prev.threejs.position.x);
    //const restDepth = prev.depth - (head.threejs.position.z - prev.threejs.position.z);

    
    //const p0 = prevExtremos[0];
    let p0 = 0;
    let p1 = 0;
    const prevSize = prevExtremos[1] - prevExtremos[0];
    const headSize = headExtremos[1] - headExtremos[0];
    const dist = prevExtremos[1] - headExtremos[1];
    const newSize = headSize - dist; // widthprev - distancia entre prevPP[1] y headPP[0] = nuevo width/depth
    //Si el centro de la cabeza es mayor o menor que el centro del bloque anterior se queda a la derecha o a la izquierda del bloque anterior)
    //let centroPrev =prevSize/2;
    // if(head.position == "x"){
    //     if(head.position.x <= prev.position.x){//antes de tiempo
    //         //cogemos p0 de referencia
    //         p0 = prevExtremos[0]; //nuevo p0
    //         newSize = headSize - (prevExtremos[0] - headExtremos[0]); //nuevo width
    //     }else{ //tarde
    //         //cogemos p1 de referencia
    //         p1 = prevExtremos[1];
    //         newSize = headSize - (headExtremos[1] - prevExtremos[1]); //nuevo width
            
    //     }
    //     BoxSize[0] = newSize;
    //     console.log("Bloque[0]= ", BoxSize[0]);
    // }
    // if(head.direction == "z"){
    //     if(head.position.z <= prev.position.z){//antes de tiempo
    //         //cogemos p0 de referencia
    //         p0 = prevExtremos[0]; //nuevo p0
    //         newSize = headSize - (prevExtremos[0] - headExtremos[0]); //nuevo width
    //     }
    //     else{ //tarde
    //         //cogemos p1 de referencia
    //         p1 = prevExtremos[1];
    //         newSize = headSize - (headExtremos[1] - prevExtremos[1]); //nuevo width
            
    //     }
    //     BoxSize[1] = newSize;
    // }
    console.log("El nuevo tamaño es", newSize);
    
    let aux = Math.abs(newSize);
    if(newSize > 0){ //Izquierda
        p0 = prevExtremos[0]; //nuevo p0
        p1 = prevExtremos[0] + newSize; //nuevo p1

    }else if (newSize < 0){ //derecha
        p0 = prevExtremos[1] + newSize; //nuevo p0 (signo más porque newSize es negativa)
        p1 = prevExtremos[1]; //nuevo p1
    }else{
        console.log("Nada que cortar!");
    }

    const pini = (p1 - p0) / 2; // nuevo centro
    
    const newExtremos = [p0, p1];
    //const vectorMedidas = [newExtremos, newSize, pini];
    console.log("Nuevo tamaño: ", newSize);
    if(head.direction == "x"){
        BoxSize[0] = aux;
        nuevoCentro[1] = pini;
    }
    else{
        BoxSize[1] = aux;
        nuevoCentro[0] = pini;
    }
}

//Resetear el juego
window.addEventListener("keydown", (e) => {
  if(e.key == "r"){
    reset();
}
});

function fin(){
  console.log("Game Over!");
  //gestión de derrota
  //reset();
  lose = true;
          jugando = false;
  end = true;
  camera.position.set(10*pila.length*hBox, 10*pila.length*hBox, 0);
  camera.lookAt(scene.position);
  //gestión de victoria

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
  const speed = 0.15;
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