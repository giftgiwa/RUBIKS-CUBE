import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RubiksCube from './rubiks-cube'
import RubiksAnimationHelper from './rubiks-animation'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
    80, /* FOV */
    window.innerWidth / window.innerHeight, /* aspect ratio */
    0.1, /* closest visible distance */
    1000 /* furthest visible distance */
);

camera.position.x = -0.15
camera.position.y = 0.15
camera.position.z = 0.15
camera.lookAt(new THREE.Vector3(0, 0, 0))

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})

renderer.setSize(
    window.innerWidth, /* width */
    window.innerHeight /* height */
)

document.body.appendChild(renderer.domElement)

// resize render on window resize
window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.minDistance = 0.15
orbitControls.maxDistance = 0.3

const ambientLight = new THREE.AmbientLight(0x404040) // soft white light
scene.add( ambientLight )

const axesHelper = new THREE.AxesHelper(0.15 )
// scene.add( axesHelper )

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

const loader = new GLTFLoader()
let rubiksCube = new THREE.Mesh() // create Rubik's cube

let pieces = []

function modelLoader(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, (data) => resolve(data), null, undefined, function (error) {
            console.error(error)
        })
    })
}

const gltfData = await modelLoader('/assets/models/rubiks.gltf')
rubiksCube = gltfData.scene
rubiksCube.scale.x = 2
rubiksCube.scale.y = 2
rubiksCube.scale.z = 2
scene.add(rubiksCube)

// initialize rubiks cube "data structure"
let rb = new RubiksCube(rubiksCube)

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
}
window.addEventListener('pointermove', onPointerMove)

let mouseDown = false
document.body.onmousedown = function () {
    mouseDown = true
}
document.body.onmouseup = function () {
    mouseDown = false
}

// const sampleButtonPlane = new THREE.PlaneGeometry(0.05, 0.05)
// const material = new THREE.MeshBasicMaterial({
//     color: 0xd1d1d1,
//     side: THREE.DoubleSide
// })

// const sampleButton = new THREE.Mesh(sampleButtonPlane, material)
// sampleButton.position.x = 0.2
// sampleButton.rotation.y = Math.PI / 2
// scene.add(sampleButton)




function animate() {
    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObjects(scene.children)

    // if (mouseDown) {
        //if (intersects.length > 0) {
        //    console.log(intersects[0])
        //}
        //RubiksAnimationHelper.setupAnimation(camera, pointer, rb, renderer, scene)
    // }

    // block orbit controls if the cube is being clicked and dragged over
    if (!mouseDown) {
        if (intersects.length > 0)
            orbitControls.enabled = false
        else
            orbitControls.enabled = true
    }

	requestAnimationFrame( animate )
	renderer.render( scene, camera )
}

animate()