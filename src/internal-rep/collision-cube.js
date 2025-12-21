import * as THREE from 'three'

/**
 * Class for storing collision cubes – invisible cube that bound each
 * Rubik's cube rendered into the scene that are used to determine which face
 * and direction the user is attempting to swipe on the cube.
 */
class CollisionCube {
	/**
	 * Constructor for the CollisionCube class.
	 * @param {*} width Width of the mesh of the cube in the scene (in meters)
	 * @param {*} dimension Dimension of the cube (2x2, 3x3, 4x4, etc.)
	 */
	constructor(width, dimension) {
		this.width = width
		this.dimension = dimension
		const geometry = new THREE.BoxGeometry(this.width, this.width, this.width)
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			transparent: true,
			opacity: 0.0
		})
		this.cube = new THREE.Mesh(geometry, material)
		this.cube.name = `collision_cube${this.dimension}x${this.dimension}`
		this.cube.updateMatrixWorld()
	}
}

export default CollisionCube