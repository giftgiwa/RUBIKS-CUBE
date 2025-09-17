import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import RubiksCubeVector from './rubiks-cube-vector'
import RotationHelper from './rubiks-rotation-helper'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {
	let q = new THREE.Quaternion();
	return function rotateAroundWorldAxis(point, axis, angle) {

		q.setFromAxisAngle(axis, angle)
		this.applyQuaternion(q)

		this.position.sub(point)
		this.position.applyQuaternion(q)
		this.position.add(point)
		return this;
	}
}()

class RubiksAnimationHelper {

	rubiksCubeVectors = {}
	currentMesh = null

	/**
	 * Desired direction of face rotation - either "cw" (clockwise) or "ccw"
	 * (counterclockwise)
	 */
	currentDirection = null

	/**
	 * Current face being rotated – either either "R" (red), "O" (orange),
	 * "Y" (yellow), "G" (green), "B" (blue), or "W" (white)
	 */
	currentColor = null

	/**
	 * Current rotation angle of face being rotated with click and drag.
	 */
	currentRotationAngle = 0

	constructor(rubiksCube, camera, renderer) {
		this.rubiksCube = rubiksCube
		this.camera = camera
		this.renderer = renderer

		console.log(rubiksCube.corners)
	}

	//decimalRound(value) {
	//	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
	//}

	handleDragAnimation(rubiksCube, originPoint, deltaMove, intersect) {

		if (!this.currentMesh)
			this.currentMesh = intersect.object.parent
		if (!this.currentColor)
			this.currentColor = "W"
		if (!this.currentDirection)
			this.currentDirection = "cw"


		const meshName = intersect.object.parent.name
		console.log(meshName)

		/**
		 * Conversion of normal at intersection of raycaster from local to
		 * world space
		 * Source: unknown...
		 */
		const localNormal = intersect.face.normal.clone()
		const worldNormal = localNormal.transformDirection(intersect.object.matrixWorld)

		//console.log("World Space Normal:", worldNormal)

		let currentDirection = this.rubiksCubeVectors['000->020'].direction
		console.log("ANGLE: ", deltaMove.angleTo(currentDirection) * (180 / Math.PI))
		console.log("COSINE: ", Math.cos(deltaMove.angleTo(currentDirection)))

		//let magnitudeProduct = Math.sqrt((deltaMove.x * deltaMove.x) + (deltaMove.y * deltaMove.y)) *
		//					   Math.sqrt((currentDirection.x * currentDirection.x) + (currentDirection.y * currentDirection.y))

		let cosine = 0
		if (Math.abs(deltaMove.angleTo(currentDirection)) <= Math.PI / 2)
			cosine = Math.cos(deltaMove.angleTo(currentDirection))

		//let rotationAmount = magnitudeProduct *
		//					 cosine
		let rotationAmount = cosine
		if (this.currentMesh != null) {
			rubiksCube.rotationGroups["W"].forEach((rubiksPiece) => {
				console.log(rubiksPiece.mesh)
				rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), rotationAmount * -0.05);
			})
			this.currentRotationAngle += rotationAmount * -0.05
		}
	
	}

	handleReleaseAnimation() {
		/**
		 * The mesh, color, and direction only get stored in the
		 * RubiksAnimationHelper class if the user drags across the cube.
		 * If not, then this function won't do anything, blocking faces from
		 * rotating from clicks without dragging.
		 */
		if (!this.currentMesh || !this.currentColor || !this.currentDirection)
			return

		if (Math.abs(this.currentRotationAngle) - (Math.PI / 2) <= 0.5) {
			this.rubiksCube.rotationGroups["W"].forEach((rubiksPiece) => {
				rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), Math.abs(this.currentRotationAngle) - (Math.PI / 2));
			})
			RotationHelper.rotateFace(
				this.rubiksCube,
				this.currentDirection,
				this.currentColor,
				true
			)
			this.currentRotationAngle = 0
		}

		/**
		 * Recalculate corner vectors after click and drag completes (in
		 * case it changes)
		 */
		this.getCornerVectors()
		console.log(this.rubiksCube.rotationGroups)
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
						//console.log(this.rubiksCube.corners[i].mesh.name)
						//console.log(this.rubiksCube.corners[j].mesh.name)
						let pointA = this.get2DPosition(this.rubiksCube.corners[i])
						let pointB = this.get2DPosition(this.rubiksCube.corners[j])
						
						this.rubiksCubeVectors[`${this.rubiksCube.corners[i].mesh.name}->${this.rubiksCube.corners[j].mesh.name}`] = new RubiksCubeVector(
							pointA, /* origin */
							this.rubiksCube.corners[i].coordinates, /* origin coordinates (in terms of triple-nested array) */
							new THREE.Vector2(pointB.x - pointA.x, pointB.y - pointA.y).normalize(), /* direction */
							new THREE.Vector2(pointA.x - pointB.x, pointA.y - pointB.y).normalize() /* negative direction */
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