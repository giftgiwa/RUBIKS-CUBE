import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import RubiksCubeVector from './rubiks-cube-vector'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class RubiksAnimationHelper {

	rubiksCubeVectors = {}

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
	getCornerVectors() {

		for (let i = 0; i < this.rubiksCube.corners.length; i++) {
			for (let j = 0; j < this.rubiksCube.corners.length; j++) {
				
				if (i != j) {
					if (this.areNeighbors(
						this.rubiksCube.corners[i].colors,
						this.rubiksCube.corners[j].colors
					)) {

						let pointA = this.get2DPosition(this.rubiksCube.corners[i])
						let pointB = this.get2DPosition(this.rubiksCube.corners[j])
						
						this.rubiksCubeVectors[`${this.rubiksCube.corners[i].colors.join("")}->${this.rubiksCube.corners[j].colors.join("")}`] = new RubiksCubeVector(
							pointA,
							new THREE.Vector2(pointB.x - pointA.x, pointB.y - pointA.y),
							new THREE.Vector2(pointA.x - pointB.x, pointA.y - pointB.y)
						)
					}
				}
			}
		}

		console.log(this.rubiksCubeVectors)
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

		let result = new THREE.Vector2(vector.x, vector.y)
		result.x = (vector.x + 1) * this.renderer.domElement.width / 2
		result.y = (-vector.y + 1) * this.renderer.domElement.height / 2

		return result
	}

}

export default RubiksAnimationHelper