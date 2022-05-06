//Creando escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Iluminación
const a_light = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente
scene.add(a_light);

const d_light = new THREE.DirectionalLight(0xffffff, 0.6); //luz direccional
d_light.position.set(10, 20, 0);
scene.add(d_light);

//Cubo
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.position(0, 0, 0);
scene.add( cube );

camera.position.z = 5;

//Rendering
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

