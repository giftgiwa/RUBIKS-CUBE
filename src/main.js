import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Keybinds from './keybinds'
import RotationHelper from './rubiks-rotation-helper'
import RubiksCube from './rubiks-cube'
import RubiksAnimationHelper from './rubiks-animation'
import { TrackballControls } from 'three/examples/jsm/Addons.js'
import UIControls from './ui/ui-controls'
import CollisionCube from './collision-cube'

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

/**
 * Check whether the user is currently using a mobile device or not.
 * Source: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 */
window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera)
  return check
}

/**
 * Sharpen resolution if user is not on a mobile device
 */
if (!window.mobileCheck())
    renderer.setPixelRatio(window.devicePixelRatio * 2)

document.body.appendChild(renderer.domElement)

/**
 * Display message for mobile users only
 */
if (window.mobileCheck() || window.innerWidth <= 450) {
    let div = document.createElement('div')
    div.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
    div.style.backdropFilter = "blur(8px)"
    div.style.zIndex = "99"
    div.style.position = "absolute"
    div.style.width = "90vw"
    div.style.verticalAlign = "middle"
    div.style.marginLeft = "5vw"
    div.style.marginRight = "5vw"
    div.style.bottom = "40px"
    div.style.padding = "10px"
    div.style.boxSizing = "border-box"

    let mobileMessage = document.createElement('p')
    mobileMessage.style.textAlign = "left"
    mobileMessage.style.width = "100%"
    mobileMessage.style.fontSize = "13px"
    mobileMessage.innerHTML = `Hello, it appears you are on a mobile device.
    <br>
    <br>
    Unfortunately, due to the nature of the implementation, of user interaction,
    the cube doesn't work very well on mobile devices :( You can even try it out
    and the faces will completely mismatch lol.
    <br>
    <br>
    I'm still trying to figure out a fix, but haven't quite found one yet.`

    div.appendChild(mobileMessage)
    document.body.appendChild(div)
}

// resize render on window resize
window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const trackballControls = new TrackballControls(camera, renderer.domElement)
trackballControls.rotateSpeed = 3.5
trackballControls.minDistance = 0.25
trackballControls.maxDistance = 0.25
trackballControls.enablePan = false
trackballControls.enableZoom = false

const ambientLight = new THREE.AmbientLight(0x404040) // soft white light
scene.add(ambientLight)

// add point lights at 8 points around the cube
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

// load model in .gltf format
function loadModel(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, (data) => resolve(data), null, undefined, function (error) {
            console.error(error)
        })
    })
}

/**
 * The renderMap object tracks which cube is to be currently rendered
 */
let currentCube = 3
let renderMap = {
    2: false,
    3: false,
    4: false,
    5: false
}
for (let i = 2; i <= 5; i++) {
    renderMap[currentCube] = true
}

const loader = new GLTFLoader()
let rubiksCube3x3Mesh = new THREE.Mesh() // create Rubik's cube
let gltfData = await loadModel('/assets/models/rubiks3x3.gltf')
rubiksCube3x3Mesh = gltfData.scene

let rubiksCube2x2Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await loadModel('/assets/models/rubiks2x2.gltf')
rubiksCube2x2Mesh = gltfData.scene

let rubiksCube4x4Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await loadModel('/assets/models/rubiks4x4.gltf')
rubiksCube4x4Mesh = gltfData.scene

let rubiksCube5x5Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await loadModel('/assets/models/rubiks5x5.gltf')
rubiksCube5x5Mesh = gltfData.scene


/**
 * Add invisble "collision cube", which is used for detecting click positions
 * and swipe directions about the cube for rotating the individual faces.
 */
const collisionCubes = [
    new CollisionCube(0.112, 2),
    new CollisionCube(0.120, 3),
    new CollisionCube(0.144, 4),
    new CollisionCube(0.168, 5),
]

// initialize rubiks cube "data structure" and helper classes
let rubiksCube2x2 = new RubiksCube(rubiksCube2x2Mesh, 2, collisionCubes[0])
let rubiksCube3x3 = new RubiksCube(rubiksCube3x3Mesh, 3, collisionCubes[1])
let rubiksCube4x4 = new RubiksCube(rubiksCube4x4Mesh, 4, collisionCubes[2])
let rubiksCube5x5 = new RubiksCube(rubiksCube5x5Mesh, 5, collisionCubes[3])

//let rubiksAnimationHelper = new RubiksAnimationHelper(rubiksCube3x3, camera, renderer)
//let keybindsObj = new Keybinds(ui, rubiksCube3x3)
//let rotationHelper = new RotationHelper(ui, trackballControls)

let rubiksMeshes = [rubiksCube2x2Mesh, rubiksCube3x3Mesh, rubiksCube4x4Mesh, rubiksCube5x5Mesh]
let rubiksCubes = [rubiksCube2x2, rubiksCube3x3, rubiksCube4x4, rubiksCube5x5]
let rubiksAnimationHelpers = []
for (let i = 0; i < rubiksCubes.length; i++) {
    if (renderMap[i + 2] == true) {
        rubiksCubes[i].isRendered = true
        scene.add(collisionCubes[i].cube)
        scene.add(rubiksMeshes[i])
    }
    rubiksAnimationHelpers.push(new RubiksAnimationHelper(rubiksCubes[i], camera, renderer))
}

let ui = new UIControls(rubiksCubes, window.mobileCheck())

let rotationHelpers = []
for (let i = 0; i < rubiksCubes.length; i++) {
    rotationHelpers.push(new RotationHelper(ui, trackballControls))
}

//let keybindsObj = new Keybinds(ui, rubiksCube3x3)

// initialize objects for detecting mouse click-and-drag interactions with scene
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const mouseMovement = new THREE.Vector2()

// initialize axes helper (for visual assistance)
const axesHelper = new THREE.AxesHelper();
axesHelper.name = "axes_helper";
axesHelper.scale.x = 0.35
axesHelper.scale.y = 0.35
axesHelper.scale.z = 0.35
scene.add(axesHelper)

/**
 * Track mouse movement as pointer movees around the screen
 * Source: https://stackoverflow.com/questions/30860773/how-to-get-the-mouse-position-using-three-js
 */
function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}
window.addEventListener('pointermove', onPointerMove)

let mouseDown = false
renderer.domElement.addEventListener('pointerdown', () => {mouseDown = true})
renderer.domElement.addEventListener('pointerup', () => {mouseDown = false})

/**
 * Add beacon atop white center-piece, made with the help of GLSL shaders.
 * Reference for GLSL code: https://thebookofshaders.com/edit.php#05/expstep.frag
 */
let cylinderGeometry = new THREE.CylinderGeometry(0.004, 0.004, 0.2)
let cylinderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        power: { value: 0.5 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float power;
        float expStep(float x, float k, float n) {
            return exp( -k * pow(x,n) );
        }
        void main() {
            float gradientFactor = vUv.y;
            float alpha = pow(gradientFactor, power);
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 - alpha); // White color (RGB) with calculated alpha
        }
    `,
    transparent: true, // enable transparency for the material
    side: THREE.DoubleSide 
})
let cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
cylinderMesh.position.y = 0.13
scene.add(cylinderMesh)

let intersects = []
let originPoint = new THREE.Vector2(0, 0)
let dragStartingOnCube = false

let intersectionPoint

renderer.domElement.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    originPoint.x = e.clientX
    originPoint.y = e.clientY

    /**
     * handleMouseDown() only gets called if the click and drag starts on the
     * Rubik's Cube in the scene.
     */
    if (intersects.length > 0) {
        dragStartingOnCube = true
        rubiksAnimationHelpers[currentCube - 2].handleMouseDown(intersects[0])
    }
})

renderer.domElement.addEventListener('pointermove', (e) => {
    e.preventDefault()
    if (!mouseDown)
        return

    mouseMovement.x = e.movementX
    mouseMovement.y = e.movementY

    /**
     * If the click and drag starts on the cube AND continues on the cube,
     * take the direction of the click and drag and rotate a face with it.
     */
    if (dragStartingOnCube &&
        !(intersectionPoint.x.toPrecision(1) == 0
            && intersectionPoint.y.toPrecision(1) == 0
            && intersectionPoint.z.toPrecision(1) == 0)
        && !rubiksCube3x3.isAnimated
        && !rubiksCube3x3.isShuffling) {
        rubiksAnimationHelpers[currentCube - 2].handleDrag(intersects[0], mouseMovement)
    }
})

/**
 * Handle release of user click (locking face to a side after click+drag to
 * rotate it)
 */
renderer.domElement.addEventListener('pointerup', (e) => {
    e.preventDefault()
    if (dragStartingOnCube) {
        dragStartingOnCube = false
        rubiksAnimationHelpers[currentCube - 2].handleMouseUp()
    }
})

/**
 * Only detect intersections with the collison cube for the cube currently rendered.
 */
const filteredChildren = scene.children.filter(
    item => (item.name.startsWith("collision_cube") && renderMap[parseInt(item.name[item.name.length - 1])] == true)
)

function animate() {
    raycaster.setFromCamera(pointer, camera)
    intersects = raycaster.intersectObjects(filteredChildren, false)
    if (intersects.length > 0) {
        intersectionPoint = intersects[0].point
    }

    /**
     * Disable trackballControls if the user starts clicking and dragging on
     * the cube itself.
     */
    if (!mouseDown) {
        if (intersects.length > 0)
            trackballControls.enabled = false
        else
            trackballControls.enabled = true
    } 

    trackballControls.update()
	window.requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

animate()