/**
 * Class for creating tiles that appear in the 2D map representation of the
 * Rubik's cube.
 */
class CubeMapTile {
	/**
	 * Creates an instance of the CubeMapTile class.
	 *
	 * @param {*} intersect
     * @param {*} coordinates coordinates of the Rubik's cube piece the tile
	 * represents
	 * @param {string} faceColor color of the face the tile currently belong to.
	 * Note: each edge on the cube is represented by two tiles, and each corner
	 * is represented by three tiles. Each tile belongs to its own face.
	 * Conversely, two tiles part of the same edge will have the same
	 * coordinates, and three tiles part of the same corner will have the same
	 * coordinates.
	 */
	constructor(tileElement, coordinates, faceColor) {
		this.tileElement = tileElement
		this.coordinates = coordinates
		this.faceColor = faceColor
	}
}

export default CubeMapTile
