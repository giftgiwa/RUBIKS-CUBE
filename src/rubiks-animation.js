import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class RubiksAnimationHelper {

	constructor(rubiksCube) {
		this.rubiksCube = rubiksCube
		console.log(this.rubiksCube)
		console.log(this.rubiksCube.corners)
	}

	setupAnimation(rubiksCube, intersects) {
		// TODO: add click and drag for rotation
		
	


	}

	/**
	 * Helper function to take the corners of the Rubik's cube and set up
	 * vectors used to detect faces being rotated from each view of the cube
	 */
	getpCornerVectors() {
		console.log("getCornerVectors()")
	}

}

export default RubiksAnimationHelper