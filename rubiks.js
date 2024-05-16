import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'
import { DragControls } from 'three/addons/controls/DragControls.js'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
    75, /* FOV */
    window.innerWidth / window.innerHeight, /* aspect ratio */
    0.1, /* closest visible distance */
    1000 /* furthest visible distance */
);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0.15


const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.setSize(
    window.innerWidth, /* width */
    window.innerHeight /* height */
)


document.body.appendChild(renderer.domElement)
// console.log(renderer.domElement)

// resize render on window resize
window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, 500)
}

const orbitControls = new OrbitControls( camera, renderer.domElement )
orbitControls.minDistance = 0.15
orbitControls.maxDistance = 0.3

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

const lightPositions = [
    [0.5, 0.5, 0.5], 
    [-0.5, 0.5, 0.5], 
    [-0.5, 0.5, -0.5], 
    [0.5, 0.5, -0.5],
    [0.5, -0.5, 0.5], 
    [-0.5, -0.5, 0.5], 
    [-0.5, -0.5, -0.5], 
    [0.5, -0.5, -0.5]
]

for (let i = 0; i < lightPositions.length; i++) {
    const light = new THREE.PointLight(
        0xffffff, /* color */
        1, /* intensity */
        100 /* distance */
    );
    light.position.set(
        lightPositions[i][0], /* x */
        lightPositions[i][1], /* y */
        lightPositions[i][2]  /* z */
    )
    scene.add(light)
}


const loader = new GLTFLoader();
let rubiksCube = new THREE.Mesh();
// loader.load( './public/assets/models/rubiks.glb', function ( gltf ) {
loader.load( './public/assets/models/rubiks.gltf', function ( gltf ) {

    rubiksCube = gltf.scene

    console.log(gltf)
    // console.log(gltf.parser.json.meshes)

    scene.add( rubiksCube )

}, undefined, function ( error ) {
        console.error( error )
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

console.log(scene.children)


function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener('pointermove', onPointerMove)




let mouseDown = false
document.body.onmousedown = function () {
    mouseDown = true
}
document.body.onmouseup = function () {
    mouseDown = false
}


function animate() {
    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children );

    // block orbit controls if the cube is being hovered over
    if (!mouseDown) {
        if (intersects.length > 0) {
            orbitControls.enabled = false
        } else {
            orbitControls.enabled = true
        }
    }


	


	requestAnimationFrame( animate )
	renderer.render( scene, camera )
}

animate();
