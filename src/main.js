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
 * Sharper resolution if user is not on a mobile device
 */
if (!window.mobileCheck())
    renderer.setPixelRatio(window.devicePixelRatio * 2)

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
orbitControls.minPolarAngle = Math.PI/4
orbitControls.maxPolarAngle = 3 * Math.PI/4


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
let rubiksCubeMesh = new THREE.Mesh() // create Rubik's cube

function modelLoader(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, (data) => resolve(data), null, undefined, function (error) {
            console.error(error)
        })
    })
}

const gltfData = await modelLoader('/assets/models/rubiks.gltf')
rubiksCubeMesh = gltfData.scene
rubiksCubeMesh.scale.x = 2
rubiksCubeMesh.scale.y = 2
rubiksCubeMesh.scale.z = 2
scene.add(rubiksCubeMesh)

// initialize rubiks cube "data structure"
let rubiksCube = new RubiksCube(rubiksCubeMesh)
let rah = new RubiksAnimationHelper(rubiksCube, camera, renderer)
rah.getCornerVectors()

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const axesHelper = new THREE.AxesHelper();
axesHelper.name = "axes_helper";
axesHelper.scale.x = 0.35
axesHelper.scale.y = 0.35
axesHelper.scale.z = 0.35
scene.add(axesHelper)

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
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
let originPoint = new THREE.Vector2(0, 0)
let dragStartingOnCube = false

renderer.domElement.addEventListener('mousedown', (e) => {
    originPoint.x = e.clientX
    originPoint.y = e.clientY

    if (intersects.length > 0) {
        dragStartingOnCube = true
        rah.handleMouseDown(intersects[0])
    }
})

/**
 * Calculate the x and y components of the direction the user clicks and drags
 * on the screen.
 */
let previousMousePosition = { x: 0, y: 0 }
renderer.domElement.addEventListener('mousemove', (e) => {
    if (!mouseDown || intersects.length == 0)
        return

    const deltaMove = new THREE.Vector2(
        e.movementX, e.movementY
    )

    /**
     * If the click and drag starts on the cube AND continues on the cube,
     * take the direction of the click and drag and rotate a face with it.
     */
    if (!orbitControls.enabled 
        && (Math.abs(deltaMove.x) <= 75 
        && Math.abs(deltaMove.y) <= 75)
        && !(deltaMove.x == 0 && deltaMove.y == 0)
        && deltaMove.length() >= 2.50)
        rah.handleDrag(deltaMove, intersects[0])

    if (mouseDown) {
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        }
    }
})

renderer.domElement.addEventListener('mouseup', (e) => {
    if (!dragStartingOnCube)
        rah.getCornerVectors()
    if (dragStartingOnCube) {
        dragStartingOnCube = false
        rah.handleMouseUp()
    }
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