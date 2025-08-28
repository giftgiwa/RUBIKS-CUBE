/**
 * Class that represents piece on Rubik's cube.
 */
class RubiksPiece {
    /**
     * Create a Rubiks Piece object.
     * @param {Array<string>} colors list of colors on the Rubik's Cube piece - either three
     *                   (corner piece), two (edge piece), or one (face piece)
     *                   unique ones from the following: "R" (red), "O"
     *                   (orange), "Y" (yellow), "G" (green), "B" (blue), or
     *                   "W" (white) 
     * @param {Array<Number>} coordinates Three-number array that indicates position of
     *                        piece on cube.
     * **About position:**
     * * for first element, top layer == 0, middle layer == 1, bottom layer == 2
     * * for second element, viewing with blue as front face and white as top
     *   face, 0 = front row, 1 = middle row, 2 = rear row
     * * for third element, viewing with blue as front face and white as top
     *   face, 0 = 
     * @param {{ string: string }} orientationMap Hash-map that represents orientation
     * **About orientation:**
     * * each key indicates a color that the RubiksPiece contains (either 1, 2,
     *   or 3 keys total)
     * * each value indicates the face that the piece resides in. For example,
     *   for the red, white, and blue corner piece, if it resided between the
     *   white, red, and blue faces such tht the white side of the piece is on
     *   the red face, the blue side is on the blue face, and the orange side is
     *   on the white face, the orientationMap would be `{'W':'R', 'B':'B', 'O':'W'}`
     * @param {*} mesh gltf mesh of individual piece on physical Rubik's Cube
     */
    constructor(colors, coordinates, orientationMap, mesh) {
        this.colors = colors
        this.coordinates = coordinates // coordinates dictates position
        this.orientationMap = orientationMap // the orientationMap dictates orientation
        this.mesh = mesh // mesh of individual piece on actual cube
    }
}

export default RubiksPiece