import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class RubiksAnimationHelper {

	//static setupMouseMovement(renderer, raycaster, pointer, camera, scene) {
	//	/**
	//	 * Getting direction of mouse movement on click and drag.
	//	 */

	//	let mouseDown = false
	//	document.body.onmousedown = () => {
	//		mouseDown = true
	//	}
	//	document.body.onmouseup = () => {
	//		mouseDown = false
	//	}

	
	//}

	static setupAnimation(rubiksCube, intersects) {
		// TODO: add click and drag for rotation
		
	


	}

	/**
	 * Helper function to take the corners of the Rubik's cube and set up
	 * vectors used to detect faces being rotated from each view of the cube
	 */
	static setupCornerVectors() {

	}

	static rotationTest(currentMesh) {
		console.log(currentMesh)

		let quaternion = new THREE.Quaternion()
		let yAxis = new THREE.Vector3(0, 1, 0)
		
		const onDrag = () => {
			console.log("hi")
		}

	}
}

export default RubiksAnimationHelper