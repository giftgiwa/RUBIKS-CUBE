import * as THREE from 'three'

class RubiksCubeVector {

	constructor(origin, originCoordinates, direction, reverseDirection) {
		this.origin = origin
		this.originCoordinates = originCoordinates
		this.direction = direction
		this.reverseDirection = reverseDirection
	}
}

export default RubiksCubeVector