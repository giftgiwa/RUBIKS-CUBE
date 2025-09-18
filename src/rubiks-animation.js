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

	//directionCornerMap = {
	//	"W|cw": new Set("000->020", "020->022", "022->002", "002->000"),
	//	"W|ccw": new Set("020->000", "022->020", "002->022", "000->002"),
	//	"Y|cw": new Set("220->200", "222->220", "202->222", "200->202"),
	//	"Y|ccw": new Set("200->220", "220->222", "222->202", "202->200"),
	//	"B|cw": new Set("000->002", "002->202", "202->200", "200->000"),
	//	"B|ccw": new Set("002->000", "202->002", "200->202", "000->200"),
	//	"G|cw": new Set("022->020", "222->022", "220->222", "020->220"),
	//	"R|cw": new Set("020->000", "220->020", "200->220", "000->200"),
	//	"R|ccw": new Set("000->020", "020->220", "220->200", "200->000"),
	//	"O|cw": new Set("002->022", "022->222", "222->202", "202->002"),
	//	"O|ccw": new Set("022->002", "222->022", "202->222", "002->202")
	//}

	directionCornerMap = {
		"W|cw": ["000->020", "020->022", "022->002", "002->000"],
		"W|ccw": ["020->000", "022->020", "002->022", "000->002"],
		"Y|cw": ["220->200", "222->220", "202->222", "200->202"],
		"Y|ccw": ["200->220", "220->222", "222->202", "202->200"],
		"B|cw": ["000->002", "002->202", "202->200", "200->000"],
		"B|ccw": ["002->000", "202->002", "200->202", "000->200"],
		"G|cw": ["022->020", "222->022", "220->222", "020->220"],
		"R|cw": ["020->000", "220->020", "200->220", "000->200"],
		"R|ccw": ["000->020", "020->220", "220->200", "200->000"],
		"O|cw": ["002->022", "022->222", "222->202", "202->002"],
		"O|ccw": ["022->002", "222->022", "202->222", "002->202"]
	}

	//swipableFace = {
	//	"W": new Set("B", "R"),	
	//}
	
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

	currentWorldNormal = null
	currentNormalColor = null

	cornerCandidates = []

	constructor(rubiksCube, camera, renderer) {
		this.rubiksCube = rubiksCube
		this.camera = camera
		this.renderer = renderer

		console.log(rubiksCube.corners)
	}

	handleMouseDown(intersect) {
		/**
		 * Conversion of normal at intersection of raycaster from local to
		 * world space
		 * Source: unknown...
		 */
		const localNormal = intersect.face.normal.clone()
		const worldNormal = localNormal.transformDirection(intersect.object.matrixWorld)
		worldNormal.x = Math.round(worldNormal.x)
		worldNormal.y = Math.round(worldNormal.y)
		worldNormal.z = Math.round(worldNormal.z)
		console.log("World Space Normal:", worldNormal)
		this.currentWorldNormal = worldNormal

		if (!this.currentMesh) {
			this.currentMesh = intersect.object.parent
		}
		console.log(this.currentMesh)

		for (const [key, value] of Object.entries(this.rubiksCubeVectors)) {
			if (key.startsWith(this.currentMesh.name)) {
				console.log(key)
				this.cornerCandidates.push(key)
			}
		}

		for (const [color, axis] of Object.entries(this.rubiksCube.rotationAxes)) {
			if (worldNormal.equals(axis)) {
				this.currentNormalColor = color
			}
		}
		//console.log(this.currentColor)


	}

	handleDragAnimation(rubiksCube, originPoint, deltaMove, intersect) {

		//if (!this.currentMesh)
		//	this.currentMesh = intersect.object.parent
		//if (!this.currentColor)
		//	this.currentColor = "W"
		//if (!this.currentDirection)
		//	this.currentDirection = "cw"

		const meshName = intersect.object.parent.name
		//console.log(meshName)

		let currentCornerVector = ""
		let maxAngle = -1
		this.cornerCandidates.forEach((candidate) => {
			//console.log(Math.cos(
			//	this.rubiksCubeVectors[candidate].direction.angleTo(deltaMove))
			//)

			let angle = Math.cos(this.rubiksCubeVectors[candidate].direction.angleTo(deltaMove))
			if (angle > maxAngle) {
				maxAngle = angle
				currentCornerVector = candidate
			}
		})

		let currentDirection = this.rubiksCubeVectors[currentCornerVector].direction
		console.log(currentCornerVector)
		//console.log(currentDirection)
		//console.log(this.currentNormalColor)
		//console.log(this.currentWorldNormal)

		for (const [faceDirection, cornerVectorSet] of Object.entries(this.directionCornerMap)) {
			//console.log(cornerVectorSet)

			if (cornerVectorSet.includes(currentCornerVector) 
				&& !rubiksCube.rotationAxes[faceDirection.substring(0, 1)].equals(this.currentWorldNormal)
				&& this.currentNormalColor != faceDirection.substring(0, 1)
			) {
				this.currentColor = faceDirection.substring(0, 1)
				this.currentDirection = faceDirection.substring(2)
				break
			}
		}

		console.log(`${this.currentColor} ${this.currentDirection}`)
		
		//console.log("ANGLE: ", deltaMove.angleTo(currentDirection) * (180 / Math.PI))
		//console.log("COSINE: ", Math.cos(deltaMove.angleTo(currentDirection)))

		//let magnitudeProduct = Math.sqrt((deltaMove.x * deltaMove.x) + (deltaMove.y * deltaMove.y)) *
		//					   Math.sqrt((currentDirection.x * currentDirection.x) + (currentDirection.y * currentDirection.y))

		let cosine = 0
		if (Math.abs(deltaMove.angleTo(currentDirection)) <= Math.PI / 2)
			cosine = Math.cos(deltaMove.angleTo(currentDirection))

		//let rotationAmount = magnitudeProduct *
		//					 cosine
		let rotationAmount = cosine
		if (this.currentMesh != null) {
			rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
			//rubiksCube.rotationGroups["W"].forEach((rubiksPiece) => {
				//console.log(rubiksPiece.mesh)
				//rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), rotationAmount * -0.05);
				if (this.currentDirection == "cw")
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), rubiksCube.rotationAxes[this.currentColor], rotationAmount * -0.05)
				else
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), rubiksCube.rotationAxes[this.currentColor], rotationAmount * 0.05)
			})
			if (this.currentDirection == "cw")
				this.currentRotationAngle += rotationAmount * -0.05
			else
				this.currentRotationAngle += rotationAmount * 0.05
		}
	
	}

	handleMouseUpAnimation() {
		/**
		 * The mesh, color, and direction only get stored in the
		 * RubiksAnimationHelper class if the user drags across the cube.
		 * If not, then this function won't do anything, blocking faces from
		 * rotating from clicks without dragging.
		 */
		if (!this.currentMesh ||
			!this.currentColor ||
			!this.currentDirection ||
			this.cornerCandidates.length == 0 ||
			!this.currentWorldNormal ||
			!this.currentNormalColor)
			return
		
		console.log(this.currentRotationAngle)
		if (Math.abs(this.currentRotationAngle) - Math.abs(Math.PI / 2) <= 0.5) {
			this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
			//this.rubiksCube.rotationGroups["W"].forEach((rubiksPiece) => {
				if (this.currentDirection == "cw")
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], Math.abs(this.currentRotationAngle) - (Math.PI / 2))
				else
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], (Math.PI / 2) - Math.abs(this.currentRotationAngle))
			})
			/**
			 * TODO: change parameters here
			 */
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
		console.log(this.rubiksCube.rotationGroups)
		this.currentMesh = null
		this.currentColor = null
		this.currentDirection = null
		this.cornerCandidates = []
		this.currentWorldNormal = null
		this.currentNormalColor = null
		this.getCornerVectors()
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