import * as THREE from 'three'
import RubiksCube from './rubiks-cube'
import RubiksPiece from './rubiks-piece'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class RubiksAnimationHelper {

	static setupAnimation(rubiksCube, intersects) {
		// TODO: add click and drag for rotation
		
	


	}

	static rotationTest(currentMesh) {
		console.log(currentMesh)

		let quaternion = new THREE.Quaternion()
		let yAxis = new THREE.Vector3(0, 1, 0)
		
		const onDrag= () => {
			console.log("hi")
		}

		currentMesh[0].on('drag', onDrag)
	}
}

export default RubiksAnimationHelper