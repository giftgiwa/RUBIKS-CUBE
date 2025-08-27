import * as THREE from 'three'
import RubiksPiece from './pieces'
import RubiksCube from './rubiks'

/**
 * Class for handling updates of coordinates and coordinate maps for individual
 * RubiksPiece objects.
 */
class RotationHelper {

    /**
     * For a given face and direction, modifies the stored groups for the
     * Rubik's cube's pieces to reflect the cube's side's physical rotation.
     * @param {RubiksCube} rubiksCube 
     * @param {string} direction direction the side of the Rubik's Cube rotates -
     *                      either "cw" (clockwise) or "ccw" (counterclockwise)
     * @param {string} color color of face piece that rotates -
     *                       either "R" (red), "O" (orange), "Y" (yellow),
     *                       "G" (green), "B" (blue), or "W" (white)
     */
    static rotateFace(rubiksCube, direction, color) {
        let rotationMap = null
        if (direction == "ccw") {
            rotationMap = rubiksCube.counterclockwiseRotationMap
            // console.log("counterclockwise")
        }
        else { // direction == "cw"
            rotationMap = rubiksCube.clockwiseRotationMap
            // console.log("clockwise")
        }

        for (let piece of rubiksCube.rotationGroups[color]) {
            if (direction == "ccw")
                piece.mesh.rotateOnWorldAxis(rubiksCube.rotationAxes[color], Math.PI / 2)
            else
                piece.mesh.rotateOnWorldAxis(rubiksCube.rotationAxes[color], -Math.PI / 2)
        }

        // console.log("rotation map")
        // console.log(rotationMap)
        
        for (let piece of rubiksCube.rotationGroups[color]) {
            if (piece.colors.length == 3) { // handling corner
                for (let i = 0; i < rotationMap[color].length; i++) {    
                    let sourceFace = rotationMap[color][i]

                    let destinationFace = null
                    if (i + 2 <= 3)
                        destinationFace = rotationMap[color][i + 2]
                    else
                        destinationFace = rotationMap[color][i - 2]

                    let adjacentFace = null
                    if (i + 1 <= 3)
                        adjacentFace = rotationMap[color][i + 1]
                    else
                        adjacentFace = rotationMap[color][0]
                    
                    // console.log("CORNER")
                    // console.log(sourceFace)
                    // console.log(destinationFace)

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece) 
                        && rubiksCube.rotationGroups[adjacentFace].includes(piece)) {
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                        this.updateCoordinates(rubiksCube, piece, direction, color)
                        break
                    }
                }
            } else if (piece.colors.length == 2) { // handling edge
                for (let i = 0; i < rotationMap[color].length; i++) {
                    let sourceFace = rotationMap[color][i]

                    let destinationFace = null
                    if (i + 1 <= 3)
                        destinationFace = rotationMap[color][i + 1]
                    else
                        destinationFace = rotationMap[color][0]
                    
                    // console.log("EDGE")
                    // console.log(sourceFace)
                    // console.log(destinationFace)

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                        this.updateCoordinates(rubiksCube, piece, direction, color)
                        this.updateOrientationMap(rubiksCube, piece, direction, color)
                        break
                    }
                }
            } else // handling center piece of face – do nothing
                continue
        }
        // console.log(rubiksCube.rotationGroups)
    }

    /**
     * Helper function that transfers a given RubikePiece object from one
     * face's array to another face's array
     * @param {RubiksCube} rubiksCube Rubiks Cube object whose rotation groups are
     *                       referenced in the implementation
     * @param {RubiksPiece} piece piece to be transferred from one face array to another
     * @param {string} sourceFace original color of face whose array the piece
     *                            belongs to - either "R" (red), "O" (orange),
     *                            "Y" (yellow), "G" (green), "B" (blue), or
     *                            "W" (white)
     * @param {string} destinationFace color of face whose array the piece gets
     *                                 moved to - either "R" (red), "O"
     *                                 (orange), "Y" (yellow), "G" (green),
     *                                 "B" (blue), "W" (white)
     */
    static transferPiece(rubiksCube, piece, sourceFace, destinationFace) {
        // remove the piece that already exists in the source face array
        for (let i = rubiksCube.rotationGroups[sourceFace].length - 1; i > -1; i--) {
            let currentPiece = rubiksCube.rotationGroups[sourceFace][i]
            if (currentPiece == piece) {
                rubiksCube.rotationGroups[sourceFace].splice(i, 1)
                break
            }
        }

        // add the piece from to the destination face array
        rubiksCube.rotationGroups[destinationFace].push(piece)
    }

    /**
     * Updates the coordinates for a given Rubik's Cube piece that moved in a 
     * specified direction along a specified face.
     * @param {RubiksCube} rubiksCube RubiksCube object whose piece is
     *                                referenced
     * @param {RubiksPiece} rubiksPiece RubiksPiece object referenced
     * @param {string} direction direction the side of the Rubik's Cube rotates,
     *                           either "cw" (clockwise) or "ccw" 
     *                           (counterclockwise)
     * @param {string} color color of face piece that rotates, either "R" (red),
     *                       "O" (orange), "Y" (yellow),
     *                       "G" (green), "B" (blue), or "W" (white)
     */
    static updateCoordinates(rubiksCube, rubiksPiece, direction, color) {

        let rotateX = () => {
            //let x_prime = 0
            //let y_prime = 0
            //let z_prime = 0
            //rubiksPiece.coordinates[0] = x_prime
            //rubiksPiece.coordinates[1] = y_prime
            //rubiksPiece.coordinates[2] = z_prime
        }

        let rotateY = () => {
            
        }

        let rotateZ = () => {

        }



        if (rubiksPiece.coordinates.toString() == [0, 0, 0].toString()) {
            console.log("updateCoordinates()")
            console.log(rubiksCube.rotationAxes)

            rotateX()
            rotateY()
            rotateZ()

            console.log(rubiksCube.rotationGroups)
        }
        
    }

    /**
     * Updates the coordinates for a given Rubik's Cube piece that moved in a 
     * specified direction along a specified face.
     * @param {RubiksCube} rubiksCube RubiksCube object whose piece is
     *                                referenced
     * @param {RubiksPiece} rubiksPiece RubiksPiece object referenced
     * @param {string} direction direction the side of the Rubik's Cube rotates,
     *                           either "cw" (clockwise) or "ccw" 
     *                           (counterclockwise)
     * @param {string} color color of face piece that rotates, either "R" (red),
     *                       "O" (orange), "Y" (yellow),
     *                       "G" (green), "B" (blue), or "W" (white)
     */
    static updateOrientationMap(rubiksCube, rubiksPiece, direction, color) {
        if (rubiksPiece.coordinates.toString() == [0, 0, 0].toString()) {
            console.log(rubiksPiece.orientationMap)


        }


    }

}

export default RotationHelper