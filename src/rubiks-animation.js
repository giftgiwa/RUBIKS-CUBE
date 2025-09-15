import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class RubiksAnimationHelper {

	constructor(rubiksCube, camera, renderer) {
		this.rubiksCube = rubiksCube
		this.camera = camera
		this.renderer = renderer
	}

	setupAnimation(rubiksCube, intersects) {
		// TODO: add click and drag for rotation
	}

	/**
	 * Helper function to take the corners of the Rubik's cube and set up
	 * vectors used to detect faces being rotated from each view of the cube
	 */
	getpCornerVectors() {

		for (let i = 0; i < this.rubiksCube.corners.length; i++) {
			for (let j = 0; j < this.rubiksCube.corners.length; j++) {
				
				if (i != j) {
					if (this.areNeighbors(
						this.rubiksCube.corners[i].colors,
						this.rubiksCube.corners[j].colors
					)) {
						console.log(this.rubiksCube.corners[i].colors)
						console.log(this.get2DPosition(this.rubiksCube.corners[i]))
						console.log(this.rubiksCube.corners[j].colors)
						console.log(this.get2DPosition(this.rubiksCube.corners[j]))
					}
					
				}
			}
			break
		}
	}

	areNeighbors(colorsA, colorsB) {
		let hashmapA = {}
		let hashmapB = {}
		for (let i = 0; i < 3; i++) {
			hashmapA[colorsA[i]] = 1
			hashmapB[colorsB[i]] = 1
		}

		let numCommonKeys = 0
		for (const [key, value] of Object.entries(hashmapA)) {
			if (key in hashmapB)
				numCommonKeys++
		}

		return numCommonKeys == 2
	}

	get2DPosition(rubiksPiece) {
		/**
		 * Sample code for getting an object's position in 3d space and translating it
		 * to 2D space (relative to renderer)
		 * Source: https://stackoverflow.com/a/27412386
		 */
		let vector = new THREE.Vector3()
		vector.setFromMatrixPosition(rubiksPiece.mesh.matrixWorld)
		vector.project(this.camera)
		vector.x = (vector.x + 1) * this.renderer.domElement.width / 2
		vector.y = (-vector.y + 1) * this.renderer.domElement.height / 2

		return vector
	}

}

export default RubiksAnimationHelper