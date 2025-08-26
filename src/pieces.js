/**
 * Class that represents piece on Rubik's cube.
 */
class RubiksPiece {

    /**
     * Create a Rubiks Piece object.
     * @param {*} colors list of colors on the Rubik's Cube piece - either three
     *                   (corner piece), two (edge piece), or one (face piece)
     *                   unique ones from the following: "R" (red), "O"
     *                   (orange), "Y" (yellow), "G" (green), "B" (blue), or
     *                   "W" (white) 
     * @param {*} coordinates Three-number array
     * @param {*} orientationMap Hash-map that represents orientation
     * @param {*} mesh 
     */
    constructor(colors, coordinates, orientationMap, mesh) {
        this.colors = colors
        this.coordinates = coordinates // coordinates dictates position
        this.orientationMap = orientationMap // the orientationMap dictates orientation
        this.mesh = mesh // mesh of individual piece on actual cube
    }
}

export default RubiksPiece