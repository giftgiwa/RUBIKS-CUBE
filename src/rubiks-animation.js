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

	rubiksCubeVectors = {}
	currentMesh = null
	currentMeshPosition = null

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
	currentCornerVector = null

	currentWorldNormal = null
	currentNormalColor = null

	cornerCandidates = []
	colorCandidates = []

	constructor(rubiksCube, camera, renderer) {
		this.rubiksCube = rubiksCube
		this.camera = camera
		this.renderer = renderer
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
		this.currentWorldNormal = worldNormal

		let facePosition = new THREE.Vector3()
		intersect.object.getWorldPosition(facePosition)

		if (!this.currentMesh) {
			this.currentMesh = intersect.object.parent
			this.getColorCandidates(this.currentMesh.name)
			this.currentMeshPosition = this.currentMesh.position
			this.currentMeshPosition = this.roundPosition(this.currentMeshPosition)
		}

		for (const [key, value] of Object.entries(this.rubiksCubeVectors)) {
			if (key.startsWith(this.currentMesh.name)) {
				this.cornerCandidates.push(key)
			}
		}

		for (const [color, axis] of Object.entries(this.rubiksCube.rotationAxes)) {
			if (worldNormal.equals(axis)) {
				this.currentNormalColor = color
			}
		}
	}

	handleDrag(rubiksCube, originPoint, deltaMove, intersect) {
		if (this.currentColor == null && this.currentDirection == null) {
			const meshName = intersect.object.parent.name

			let currentCornerVector = ""
			let maxAngle = -2
			this.cornerCandidates.forEach((candidate) => {
				let angle = Math.cos(this.rubiksCubeVectors[candidate].direction.angleTo(deltaMove))
				if (angle > maxAngle) {
					maxAngle = angle
					currentCornerVector = candidate
				}
			})

			this.currentCornerVector = currentCornerVector
			console.log(currentCornerVector)

			let maximumDistance = 0
			let likelyFaceDirection = ""

			for (const [faceDirection, cornerVectorSet] of Object.entries(this.directionCornerMap)) {

				if (cornerVectorSet.includes(currentCornerVector) 
					&& !rubiksCube.rotationAxes[faceDirection.substring(0, 1)].equals(this.currentWorldNormal)
					&& this.currentNormalColor != faceDirection.substring(0, 1)
				) {
					let facePosition = new THREE.Vector3(
						this.currentMeshPosition.x,
						this.currentMeshPosition.y,
						this.currentMeshPosition.z
					)
					let faceNormal = new THREE.Vector3(
						rubiksCube.rotationAxes[faceDirection.substring(0, 1)].x * 0.02,
						rubiksCube.rotationAxes[faceDirection.substring(0, 1)].y * 0.02,
						rubiksCube.rotationAxes[faceDirection.substring(0, 1)].z * 0.02
					)
					facePosition.add(faceNormal)
					//console.log(`Face position: ${facePosition.x},${facePosition.y},${facePosition.z}`)
					//console.log(`Distance to point: ${facePosition.distanceTo(intersect.point)}`)

					if (facePosition.distanceTo(intersect.point) > maximumDistance) {
						likelyFaceDirection = faceDirection
						maximumDistance = facePosition.distanceTo(intersect.point)
					}
				}
			}
			this.currentColor = likelyFaceDirection.substring(0, 1)
			this.currentDirection = likelyFaceDirection.substring(2)

			console.log(`${this.currentColor} ${this.currentDirection}`)
		}
		
		let currentDirection = this.rubiksCubeVectors[this.currentCornerVector].direction
		let cosine = 0
		if (Math.abs(deltaMove.angleTo(currentDirection)) <= Math.PI / 2)
			cosine = Math.cos(deltaMove.angleTo(currentDirection))

		let rotationAmount = cosine
		if (this.currentMesh != null && this.currentColor) {
			rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
				//console.log(rubiksPiece.mesh)
				//rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), rotationAmount * -0.05);


				//if (this.currentDirection == "cw")
				//	rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), rubiksCube.rotationAxes[this.currentColor], rotationAmount * -0.05)
				//else
				//	rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), rubiksCube.rotationAxes[this.currentColor], rotationAmount * 0.05)
			})
			//if (this.currentDirection == "cw")
				//this.currentRotationAngle += rotationAmount * -0.05
			//else
				//this.currentRotationAngle += rotationAmount * 0.05
		}
	
	}

	handleMouseUp() {
		/**
		 * If any of the member variables involves in the external
		 * and internal representation of the Rubik's cube aren't
		 * properly set, then the rotation locking isn't attempted.
		 */
		if (!this.currentMesh ||
			!this.currentMeshPosition ||
			!this.currentColor ||
			!this.currentDirection ||
			this.cornerCandidates.length == 0 ||
			this.colorCandidates.length == 0 ||
			!this.currentWorldNormal ||
			!this.currentNormalColor ||
			!this.currentCornerVector) {
			this.currentMesh = null
			this.currentMeshPosition = null
			this.currentDirection = null
			this.currentColor = null
			this.currentWorldNormal = null
			this.currentNormalColor = null
			this.currentCornerVector = null
			this.currentRotationAngle = 0
			this.cornerCandidates = []
			this.colorCandidates = []
			this.getCornerVectors()
			return
		}
		
		console.log(this.currentRotationAngle)
		if (Math.abs(this.currentRotationAngle) - Math.abs(Math.PI / 2) <= 0.5) {
			this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
				
				
				//if (this.currentDirection == "cw")
				//	rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], Math.abs(this.currentRotationAngle) - (Math.PI / 2))
				//else
				//	rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], (Math.PI / 2) - Math.abs(this.currentRotationAngle))
			})

			//RotationHelper.rotateFace(
			//	this.rubiksCube,
			//	this.currentDirection,
			//	this.currentColor,
			//	true
			//)

			this.currentRotationAngle = 0
		}

		/**
		 * Recalculate corner vectors after click and drag completes (in
		 * case it changes)
		 */
		console.log(this.rubiksCube.rotationGroups)
		this.currentMesh = null
		this.currentMeshPosition = null
		this.currentDirection = null
		this.currentColor = null
		this.currentWorldNormal = null
		this.currentNormalColor = null
		this.currentCornerVector = null
		this.cornerCandidates = []
		this.colorCandidates = []
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
						let pointA = this.get2DPosition(this.rubiksCube.corners[i].mesh)
						let pointB = this.get2DPosition(this.rubiksCube.corners[j].mesh)
						
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

		//console.log(this.rubiksCubeVectors)
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

	get2DPosition(mesh) {
		/**
		 * Sample code for getting an object's position in 3d space and translating it
		 * to 2D space (relative to renderer)
		 * Source: https://stackoverflow.com/a/27412386
		 */
		let vector = new THREE.Vector3()
		vector.setFromMatrixPosition(mesh.matrixWorld)
		vector.project(this.camera)

		let result = new THREE.Vector2(vector.x, vector.y)
		result.x = (vector.x + 1) * this.renderer.domElement.width / 2
		result.y = (-vector.y + 1) * this.renderer.domElement.height / 2

		return result
	}

	getColorCandidates(meshName) {
		if (meshName.substring(0, 1) == '0') this.colorCandidates.push("W")
		if (meshName.substring(0, 1) == '2') this.colorCandidates.push("Y")
		if (meshName.substring(1, 2) == '0') this.colorCandidates.push("R")
		if (meshName.substring(1, 2) == '2') this.colorCandidates.push("O")
		if (meshName.substring(2, 3) == '0') this.colorCandidates.push("B")
		if (meshName.substring(2, 3) == '2') this.colorCandidates.push("G")
		return
	}

	roundPosition(v) {
		return new THREE.Vector3(
			Number(v.x.toPrecision(1)),
			Number(v.y.toPrecision(1)), 
			Number(v.z.toPrecision(1))
		)
	}


}

export default RubiksAnimationHelper