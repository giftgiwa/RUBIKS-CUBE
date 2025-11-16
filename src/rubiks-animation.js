import * as THREE from 'three'
import RotationHelper from './rubiks-rotation-helper'

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

const FRAME_COUNT = 8

/**
 * Class for handling updates of orientations and positions of the individual
 * cube pieces (the cube's external representation) for groups RubiksPiece
 * objects (faces).
 */
class RubiksAnimationHelper {
    currentDirection = null
    currentColor = null
    currentRotationAngle = 0
    currentIntersectionNormal = null
    startingPosition = null

	colorCandidates = []
	previousRaycasterPosition = null

    frameCounter = 0
    avgDeltaMove = new THREE.Vector3(0, 0, 0)
    deltaMove = null

    faceBoounds = {
        'W': [[-Infinity, Infinity], [0.02, 0.06], [-Infinity, Infinity]],
        'B': [[-Infinity, Infinity], [-Infinity, Infinity], [0.02, 0.06]],
        'O': [[0.02, 0.06], [-Infinity, Infinity], [-Infinity, Infinity]],
        'G': [[-Infinity, Infinity], [-Infinity, Infinity], [-0.06, -0.02]],
        'R': [[-0.06, -0.02], [-Infinity, Infinity], [-Infinity, Infinity]],
        'Y': [[-Infinity, Infinity], [-0.06, -0.02], [-Infinity, Infinity]]
    }

    faceComponentMap = {
        'W': new Set(["z", "x"]),
        'B': new Set(["x", "y"]),
        'O': new Set(["y", "z"]),
        'G': new Set(["x", "y"]),
        'R': new Set(["y", "z"]),
        'Y': new Set(["z", "x"])
    }

    constructor(rubiksCube, camera, renderer) {
		this.rubiksCube = rubiksCube
		this.camera = camera
		this.renderer = renderer
	}

    /**
     * Helper function to round THREE.Vector3() components to 3 significant figures
     * if not extremely small in magnitude (< 0.0000001) and otherwise, sets the
     * components to 0.
     * @param {THREE.Vector3()} v Vector to round
     * @returns Rounded version of vector
     */
    roundVector(v) {
        let x = Math.abs(v.x) < 0.0000001 ? 0 : v.x.toPrecision(3)
        let y = Math.abs(v.y) < 0.0000001 ? 0 : v.y.toPrecision(3)
        let z = Math.abs(v.z) < 0.0000001 ? 0 : v.z.toPrecision(3)
        return new THREE.Vector3(Number(x), Number(y), Number(z))
    }

    /**
     * Helper function to get the axis of the largest vector component by magnitude.
     * @param {THREE.Vector3} v Vector to get largest component of
     * @returns "x", "y", or "z" for the axis along which the largest vector component lies.
     */
    getLargestVectorComponent(v) {
        let result = "x"
        let largestComponentMagnitude = Math.abs(v.x)
        if (Math.abs(v.y) > largestComponentMagnitude) {
            result = "y"
            largestComponentMagnitude = Math.abs(v.y)
        }
        if (Math.abs(v.z) > largestComponentMagnitude) {
            result = "z"
            largestComponentMagnitude = Math.abs(v.z)
        }
        return result
    }

    /**
     * Handles the user mouse down action.
     * 
     * handleMouseDown() detects and stores the normal of the face on which the
     * user clicks on on the Rubik's Cube (or more specifically, the invisible
     * collision cube). It also updates a state variable to indicate that the
     * cube is currently rotating. It then store an array of "color candidates" –
     * faces that the user could be trying to rotate, which would be based on
     * the position in the scene that the user's mouse clicks on.
     * @param {*} intersect 
     */
    handleMouseDown(intersect) {
        this.currentIntersectionNormal = intersect.face.normal.clone()
        this.startingPosition = this.roundVector(intersect.point)
        this.rubiksCube.isRotating = true

        /**
         * Check which of the faces on the Rubik's Cube the user could be
         * clicking on (before dragging).
         */
        for (const [key, value] of Object.entries(this.faceBoounds)) {
            let x = this.startingPosition.x, y = this.startingPosition.y, z = this.startingPosition.z

            if ((x >= value[0][0] && x <= value[0][1]) &&
                (y >= value[1][0] && y <= value[1][1]) &&
                (z >= value[2][0] && z <= value[2][1]) &&
                (!this.currentIntersectionNormal.equals(this.rubiksCube.rotationAxes[key]))) {
                this.colorCandidates.push(key)
            }
        }
    }


    /**
     * Handles the user mouse drag action (only triggers when the user is
     * holding down with their mouse).
     * 
     * handleMouseDrag() gets the average of multiple frames of movement
     * over which the user drags their mouse, determines the face and direction
     * the the user is mose likely attempting to rotate, and incrementatlly
     * rotates the face accordingly.
     * 
     * @param {*} intersect 
     * @param {*} mouseMovement
     */
	handleDrag(intersect, mouseMovement) {
        if (this.currentColor == null && this.currentDirection == null) {
            if (this.frameCounter == FRAME_COUNT) {

                let largestVectorComponent = this.getLargestVectorComponent(this.avgDeltaMove)
                this.colorCandidates.forEach((colorCandidate) => {
                    if (this.faceComponentMap[colorCandidate].has(largestVectorComponent)) {
                        this.currentColor = colorCandidate
                    }
                })

                let crossProduct = this.avgDeltaMove.clone()
                if (this.currentColor) {
                    crossProduct.cross(this.rubiksCube.rotationAxes[this.currentColor].clone())
                    
                    let normalizedCrossProduct = this.roundVector(crossProduct.normalize())

                    if (normalizedCrossProduct.dot(this.currentIntersectionNormal) < 0) 
                        this.currentDirection = "cw"
                    else
                        this.currentDirection = "ccw"
                }

            }
            else {
                if (this.previousRaycasterPosition && this.frameCounter != FRAME_COUNT) {
                    let deltaMove
                    if (intersect)
                        deltaMove = intersect.point.clone()
                    else
                        deltaMove = this.deltaMove
                    deltaMove.sub(this.previousRaycasterPosition)
                    deltaMove = this.roundVector(deltaMove)
                    this.deltaMove = deltaMove

                    this.avgDeltaMove.x *= (this.frameCounter / (this.frameCounter + 1))
                    this.avgDeltaMove.x += deltaMove.x / (this.frameCounter + 1)

                    this.avgDeltaMove.y *= (this.frameCounter / (this.frameCounter + 1))
                    this.avgDeltaMove.y += deltaMove.y / (this.frameCounter + 1)

                    this.avgDeltaMove.z *= (this.frameCounter / (this.frameCounter + 1))
                    this.avgDeltaMove.z += deltaMove.z / (this.frameCounter + 1)

                    this.frameCounter += 1
                }
                
                if (intersect)
                    this.previousRaycasterPosition = intersect.point
                else
                    this.previousRaycasterPosition = this.deltaMove
            }
        } else {
            let deltaMove
            if (intersect) {
                deltaMove = intersect.point.clone()
            }
            else {
                deltaMove = this.deltaMove
            }
            deltaMove.sub(this.previousRaycasterPosition)
            deltaMove = this.roundVector(deltaMove)
            this.deltaMove = deltaMove

            let rotationAmount = mouseMovement.length() * 1.15 * Math.PI / 90

            if (this.currentColor != null && this.currentDirection != null) {
                if (this.currentDirection == "cw") {
                    if (this.currentRotationAngle - rotationAmount > -Math.PI / 2) {
                        this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
                            rubiksPiece.mesh.rotateAroundWorldAxis(
                                new THREE.Vector3(0, 0, 0),
                                this.rubiksCube.rotationAxes[this.currentColor],
                                -rotationAmount
                            )
                        })
                        this.currentRotationAngle -= rotationAmount
                    }
                } else if (this.currentDirection == "ccw") { // this.currentDirection == "ccw"
                    if (this.currentRotationAngle + rotationAmount < Math.PI / 2) {
                        this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
                            rubiksPiece.mesh.rotateAroundWorldAxis(
                                new THREE.Vector3(0, 0, 0),
                                this.rubiksCube.rotationAxes[this.currentColor],
                                rotationAmount
                            )
                        })
                        this.currentRotationAngle += rotationAmount
                        
                    }
                }
            }
        }
	}

    /**
     * Handles the user mouse up (click release) action (only triggers when the user is
     * holding down with their mouse).
     * @returns 
     */
    handleMouseUp() {
        if (
            !this.currentDirection ||
            !this.currentColor ||
            !this.currentIntersectionNormal ||
            !this.startingPosition ||
            this.colorCandidates == [] ||
            !this.previousRaycasterPosition
        ) {
            this.currentDirection = null
            this.currentColor = null
            this.currentRotationAngle = 0
            this.currentIntersectionNormal = null
            this.startingPosition = null
            this.colorCandidates = []
            this.previousRaycasterPosition = null
            this.frameCounter = 0

            this.rubiksCube.isRotating = false
            return
        }

        if (Math.abs(Math.abs(this.currentRotationAngle) - (Math.PI / 2)) <= Math.PI / 4) {
            let difference = Math.abs(Math.abs(this.currentRotationAngle) - (Math.PI / 2))

            this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
				
				if (this.currentDirection == "cw")
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], -difference)
				else
					rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], difference)
			})

			RotationHelper.rotateFace(
				this.rubiksCube,
				this.currentDirection,
				this.currentColor,
				true
			)
        } else {
            let difference = Math.abs(this.currentRotationAngle)
            this.rubiksCube.rotationGroups[this.currentColor].forEach((rubiksPiece) => {
                
                if (this.currentDirection == "cw")
                    rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], difference)
                else
                    rubiksPiece.mesh.rotateAroundWorldAxis(new THREE.Vector3(0, 0, 0), this.rubiksCube.rotationAxes[this.currentColor], -difference)
            })
        }

		this.currentDirection = null
		this.currentColor = null
        this.currentRotationAngle = 0
		this.currentIntersectionNormal = null
        this.startingPosition = null
		this.colorCandidates = []
        this.previousRaycasterPosition = null
        this.frameCounter = 0
        this.avgDeltaMove = new THREE.Vector3(0, 0, 0)
        this.deltaMove = null

        this.rubiksCube.isRotating = false
    }

}

export default RubiksAnimationHelper