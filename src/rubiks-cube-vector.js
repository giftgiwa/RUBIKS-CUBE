import * as THREE from 'three'

class RubiksCubeVector {

	constructor(origin, direction, reverseDirection) {
		this.origin = origin
		this.direction = direction
		this.reverseDirection = reverseDirection
	}
}

export default RubiksCubeVector