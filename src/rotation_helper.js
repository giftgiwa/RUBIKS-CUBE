import * as THREE from 'three'
import RubiksPiece from './pieces'

/**
 * Class for handling updates of coordinates and coordinate maps for individual
 * RubiksPiece objects.
 */
class RotationHelper {

    static rotateFace(rubiksCube, direction, color) {
        let rotationMap = null
        if (direction == "ccw")
            rotationMap = rubiksCube.counterclockwiseRotationMap
        else // direction == "cw"
            rotationMap = rubiksCube.clockwiseRotationMap

        for (let piece of rubiksCube.rotationGroups[color])
            if (direction == "ccw")
                piece.mesh.rotateOnWorldAxis(rubiksCube.rotationAxes[color], Math.PI / 2)
            else
                piece.mesh.rotateOnWorldAxis(rubiksCube.rotationAxes[color], -Math.PI / 2)

        for (let piece of rubiksCube.rotationGroups[color]) {
            if (piece.colors.length == 3) { // handling corners
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
                        this.rotatePiece(rubiksCube, piece, sourceFace, destinationFace)
                        break
                    }
                }
            } else if (piece.colors.length == 2) { // handling edges
                for (let i = 0; i < rotationMap[color].length; i++) {
                    let sourceFace = rotationMap[color][i]

                    let destinationFace = null
                    if (i + 1 <= 3)
                        destinationFace = rotationMap[color][i + 1]
                    else
                        destinationFace = rotationMap[color][0]

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                        this.rotatePiece(rubiksCube, piece, sourceFace, destinationFace)
                        break
                    }
                }
            } else // handling center piece – do nothing
                continue
        }
        console.log(rubiksCube.rotationGroups)
    }

    static rotatePiece(rubiksCube, piece, sourceFace, destinationFace) {
        // remove the piece that already exists
        for (let i = rubiksCube.rotationGroups[sourceFace].length - 1; i > -1; i--) {
            let currentPiece = rubiksCube.rotationGroups[sourceFace][i]
            if (currentPiece == piece) {
                rubiksCube.rotationGroups[sourceFace].splice(i, 1)
                break
            }
        }
        rubiksCube.rotationGroups[destinationFace].push(piece)
    }

}

export default RotationHelper