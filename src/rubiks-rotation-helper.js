import * as THREE from 'three'
import RubiksPiece from './rubiks-piece'
import RubiksCube from './rubiks-cube'

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
    static rotateFace(rubiksCube, direction, color, swiping) {
        let origin = new THREE.Vector3(0, 0, 0)
        let rotationMap = null
        if (direction == "ccw")
            rotationMap = rubiksCube.counterclockwiseRotationMap
        else // direction == "cw"
            rotationMap = rubiksCube.clockwiseRotationMap

        if (!swiping) {
            for (let piece of rubiksCube.rotationGroups[color]) {
                if (direction == "ccw") {
                    piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], Math.PI / 2)
                }
                else
                    piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], -Math.PI / 2)
            }
        }
        
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

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece) 
                        && rubiksCube.rotationGroups[adjacentFace].includes(piece)) {
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                        this.updateCoordinates(piece, direction, color)
                        this.updateOrientationMap(rubiksCube, piece, direction, color)
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

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                        this.updateCoordinates(piece, direction, color)
                        this.updateOrientationMap(rubiksCube, piece, direction, color)
                        break
                    }
                }
            } else // handling center piece of face – do nothing
                continue
        }
        //console.log(rubiksCube.coordinateMap)
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
    static updateCoordinates(rubiksPiece, direction, color) {
        //console.log(rubiksPiece)
        let rotationOrigins = {
            "W": [0, 1, 1],
            "B": [1, 0, 1],
            "O": [1, 1, 2],
            "G": [1, 2, 1],
            "R": [1, 1, 0],
            "Y": [2, 1, 1]
        }

        let negativeAxisFaces = new Set(["R", "W", "B"])

        let x = rubiksPiece.coordinates[0]
        let y = rubiksPiece.coordinates[1]
        let z = rubiksPiece.coordinates[2]
        let x0 = rotationOrigins[color][0]
        let y0 = rotationOrigins[color][1]
        let z0 = rotationOrigins[color][2]

        let angle = Math.PI / 2 // 90 degrees counterclockwise
        if ((negativeAxisFaces.has(color) && direction == "cw") ||
                (!negativeAxisFaces.has(color) && direction == "ccw")) {
            angle = Math.PI / 2
        } else {
            angle = -Math.PI / 2
        }

        if (color == "W" || color == "Y") { // "x"
            rubiksPiece.coordinates[1] = Math.round(Math.abs(
                y*Math.cos(angle) - z*Math.sin(angle) + y0*(1 - Math.cos(angle)) + z0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[2] = Math.round(Math.abs(
                y*Math.sin(angle) + z*Math.cos(angle) + z0*(1 - Math.cos(angle)) - y0*Math.sin(angle)
            ))
        } else if (color == "G" || color == "B") { // "y"
            rubiksPiece.coordinates[0] = Math.round(Math.abs(
                x*Math.cos(angle) + z*Math.sin(angle) + z0*(1 - Math.cos(angle)) - x0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[2] = Math.round(Math.abs(
                -x*Math.sin(angle) + z*Math.cos(angle) + x0*(1 - Math.cos(angle)) + z0*Math.sin(angle)
            ))
        } else { // "z"; color == "R" || color == "O"
            rubiksPiece.coordinates[0] = Math.round(Math.abs(
                x*Math.cos(angle) - y*Math.sin(angle) + x0*(1 - Math.cos(angle)) + y0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[1] = Math.round(Math.abs(
                x*Math.sin(angle) + y*Math.cos(angle) + y0*(1 - Math.cos(angle)) - x0*Math.sin(angle)
            ))
        }
        rubiksPiece.mesh.name = `${rubiksPiece.coordinates[0]}${rubiksPiece.coordinates[1]}${rubiksPiece.coordinates[2]}`
        rubiksPiece.mesh.userData.name = `${rubiksPiece.coordinates[0]}${rubiksPiece.coordinates[1]}${rubiksPiece.coordinates[2]}`
        //console.log(rubiksPiece)
        
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
        let rotationMap = null
        if (direction == "cw")
            rotationMap = rubiksCube.clockwiseRotationMap[color]
        else
            rotationMap = rubiksCube.counterclockwiseRotationMap[color]

        Object.entries(rubiksPiece.orientationMap).forEach((face) => {
            let currentPieceColor = face[0]
            let currentFace = face[1]

            if (currentFace != color) {

                for (let i = 0; i < rotationMap.length; i++) {
                    if (rotationMap[i] == currentFace) {
                        if (i + 1 <= 3)
                            rubiksPiece.orientationMap[currentPieceColor] = rotationMap[i + 1]
                        else
                            rubiksPiece.orientationMap[currentPieceColor] = rotationMap[0]
                    }
                }

            }
        })
    }
}

export default RotationHelper