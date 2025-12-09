import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Keybinds from './keybinds'
import RotationHelper from './rubiks-rotation-helper'
import RubiksCube from './rubiks-cube'
import RubiksAnimationHelper from './rubiks-animation'
import { TrackballControls } from 'three/examples/jsm/Addons.js'
import UIControls from './ui-controls'

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

// add point lights at 8 points around the cube
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

// load Rubik's Cube mesh (in .gltf format)
function modelLoader(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, (data) => resolve(data), null, undefined, function (error) {
            console.error(error)
        })
    })
}

const loader = new GLTFLoader()
let rubiksCube3x3Mesh = new THREE.Mesh() // create Rubik's cube
let gltfData = await modelLoader('/assets/models/rubiks3x3.gltf')
rubiksCube3x3Mesh = gltfData.scene
rubiksCube3x3Mesh.scale.x = 2
rubiksCube3x3Mesh.scale.y = 2
rubiksCube3x3Mesh.scale.z = 2
scene.add(rubiksCube3x3Mesh)

let rubiksCube2x2Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await modelLoader('/assets/models/rubiks2x2.gltf')
rubiksCube2x2Mesh = gltfData.scene
rubiksCube2x2Mesh.scale.x = 2
rubiksCube2x2Mesh.scale.y = 2
rubiksCube2x2Mesh.scale.z = 2
//scene.add(rubiksCube2x2Mesh)

let rubiksCube4x4Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await modelLoader('/assets/models/rubiks4x4.gltf')
rubiksCube4x4Mesh = gltfData.scene
rubiksCube4x4Mesh.scale.x = 2
rubiksCube4x4Mesh.scale.y = 2
rubiksCube4x4Mesh.scale.z = 2
//scene.add(rubiksCube4x4Mesh)

let rubiksCube5x5Mesh = new THREE.Mesh() // create Rubik's cube
gltfData = await modelLoader('/assets/models/rubiks5x5.gltf')
rubiksCube5x5Mesh = gltfData.scene
rubiksCube5x5Mesh.scale.x = 2
rubiksCube5x5Mesh.scale.y = 2
rubiksCube5x5Mesh.scale.z = 2
//scene.add(rubiksCube5x5Mesh)

/**
 * Add invisble "collision cube", which is used for detecting click positions
 * and swipe directions about the cube for rotating the individual faces.
 */
const collisionCubeGeometry = new THREE.BoxGeometry(0.120, 0.120, 0.120)
const collisionCubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.0
})
const collisionCube = new THREE.Mesh(collisionCubeGeometry, collisionCubeMaterial)
collisionCube.name = "collision_cube"
collisionCube.updateMatrixWorld()
scene.add(collisionCube)

// initialize rubiks cube "data structure" and helper classes
let rubiksCube3x3 = new RubiksCube(rubiksCube3x3Mesh, 3)
let rubiksAnimationHelper = new RubiksAnimationHelper(rubiksCube3x3, camera, renderer)
let ui = new UIControls(rubiksCube3x3, window.mobileCheck())
let keybindsObj = new Keybinds(ui, rubiksCube3x3)
let rotationHelper = new RotationHelper(ui, trackballControls)

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
//scene.add(axesHelper)

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
document.body.onmousedown = () => {mouseDown = true}
document.body.onmouseup = () => {mouseDown = false}

renderer.domElement.addEventListener('pointerdown', (e) => {
    mouseDown = true
})

renderer.domElement.addEventListener('pointerup', (e) => {
    mouseDown = false
})

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
    transparent: true, // Crucial: enable transparency for the material
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
        rubiksAnimationHelper.handleMouseDown(intersects[0])
    }
})

/**
 * 
 */
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
        rubiksAnimationHelper.handleDrag(intersects[0], mouseMovement)
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
        rubiksAnimationHelper.handleMouseUp()
    }
})

const filteredChildren = scene.children.filter(item => item.name == "collision_cube") // only detect intersections with the collison cube
function animate() {
    raycaster.setFromCamera(pointer, camera)
    intersects = raycaster.intersectObjects(filteredChildren, false)
    if (intersects.length > 0)
        intersectionPoint = intersects[0].point

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

    trackballControls.update();
	window.requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

animate()