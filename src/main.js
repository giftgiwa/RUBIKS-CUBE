import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RubiksCube from './rubiks-cube'
import RubiksAnimationHelper from './rubiks-animation'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    80, /* FOV */
    window.innerWidth / window.innerHeight, /* aspect ratio */
    0.1, /* closest visible distance */
    1000 /* furthest visible distance */
)

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
orbitControls.enablePan = false
orbitControls.enableZoom = false

const ambientLight = new THREE.AmbientLight(0x404040) // soft white light
scene.add( ambientLight )

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
    )
    light.position.set(
        lightPositions[i][0], /* x */
        lightPositions[i][1], /* y */
        lightPositions[i][2]  /* z */
    )
    scene.add(light)
}

const loader = new GLTFLoader()
let rubiksCube = new THREE.Mesh() // create Rubik's cube

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
let rah = new RubiksAnimationHelper(rb)

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const axesHelper = new THREE.AxesHelper();
axesHelper.name = "axes_helper";
axesHelper.scale.x = 0.35
axesHelper.scale.y = 0.35
axesHelper.scale.z = 0.35
console.log(axesHelper)
scene.add(axesHelper)

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
}
window.addEventListener('pointermove', onPointerMove)

let mouseDown = false
document.body.onmousedown = () => {
    mouseDown = true
}
document.body.onmouseup = () => {
    mouseDown = false
}

let intersects = []

/**
 * Calculate the x and y components of the direction the user clicks and drags
 * on the screen
 */
let previousMousePosition = { x: 0, y: 0 }
renderer.domElement.addEventListener('mousemove', (e) => {
    if (!mouseDown || intersects.length == 0)
        return

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    }

    /**
     * If the click and drag starts on the cube AND continues on the cube,
     * take the direction of the click and drag and rotate a face with it
     */
    if (!orbitControls.enabled && (Math.abs(deltaMove.x) <= 75 && Math.abs(deltaMove.y) <= 75)) {
        console.log(deltaMove)
        console.log(intersects[0])

        // TODO: Implement swipe direction tracking
        
    }

    if (mouseDown) {
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        }
    }
})

renderer.domElement.addEventListener('mouseup', (e) => {
    console.log("mouse up")
})


console.log(rubiksCube)

/**
 * Sample code for getting an object's position in 3d space and translating it
 * to 2D space (relative to renderer)
 * Source: https://stackoverflow.com/a/27412386
 */
let vector = new THREE.Vector3()
vector.setFromMatrixPosition(rb.coordinateMap[0][0][0].mesh.matrixWorld)
vector.project(camera)
vector.x = (vector.x + 1) * renderer.domElement.width / 2;
vector.y = (-vector.y + 1) * renderer.domElement.height / 2;

renderer.domElement.addEventListener('click', (e) => {
    let currentPosition = {
        x: e.clientX,
        y: e.clientY
    }
    console.log(currentPosition)
})

const filteredChildren = scene.children.filter(item => item.name !== "axes_helper")


function animate() {
    raycaster.setFromCamera(pointer, camera)
    
    intersects = raycaster.intersectObjects(filteredChildren)
    if (!mouseDown) {
        if (intersects.length > 0)
            orbitControls.enabled = false
        else
            orbitControls.enabled = true
    }
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

animate()