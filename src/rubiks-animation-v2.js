import * as THREE from 'three'
import RubiksCubeVector from './rubiks-cube-vector'
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

class RubiksAnimationHelperV2 {
    currentMesh = null
	currentMeshPosition = null
    currentDirection = null
    currentColor = null

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


    roundPosition(v) {
        return new THREE.Vector3(
            Number(v.x.toPrecision(1)),
            Number(v.y.toPrecision(1)), 
            Number(v.z.toPrecision(1))
        )
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
            // this.getColorCandidates(this.currentMesh.name)
            this.currentMeshPosition = this.currentMesh.position
            this.currentMeshPosition = this.roundPosition(this.currentMeshPosition)
        }

        // for (const [key, value] of Object.entries(this.rubiksCubeVectors)) {
        //     if (key.startsWith(this.currentMesh.name)) {
        //         this.cornerCandidates.push(key)
        //     }
        // }

        // for (const [color, axis] of Object.entries(this.rubiksCube.rotationAxes)) {
        //     if (worldNormal.equals(axis)) {
        //         this.currentNormalColor = color
        //     }
        // }
        console.log(this.currentMesh)
        console.log(this.currentMeshPosition)
        console.log(this.currentWorldNormal)
        this.getColorCandidates(this.currentMesh.name)
        console.log(this.colorCandidates)

    }

    getColorCandidates(meshName) {
		if (meshName.substring(0, 1) == '0' && this.currentWorldNormal.equals(this.rubiksCube.)) this.colorCandidates.push("W")
		if (meshName.substring(0, 1) == '2') this.colorCandidates.push("Y")
		if (meshName.substring(1, 2) == '0') this.colorCandidates.push("R")
		if (meshName.substring(1, 2) == '2') this.colorCandidates.push("O")
		if (meshName.substring(2, 3) == '0') this.colorCandidates.push("B")
		if (meshName.substring(2, 3) == '2') this.colorCandidates.push("G")
		return
	}


    handleMouseUp() {




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
    }

}

export default RubiksAnimationHelperV2