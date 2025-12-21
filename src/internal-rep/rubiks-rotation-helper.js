import * as THREE from 'three'
import RubiksPiece from './rubiks-piece'
import RubiksCube from '../rubiks-cube'
import UIControls from '../ui/ui-controls'

/**
 * Prototype for rotating an Object3D around an axis in world space by a specified
 * angle.
 * 
 * Source: https://stackoverflow.com/a/32038265/17799976
 */
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
 * Class for handling updates of coordinates and coordinate maps (the cube's
 * internal representation) for individual RubiksPiece objects.
 */
class RotationHelper {

    static currentRotationAnimationAngle = 0.0
    static doAnimate = false

    /**
     * Creates an instance of the RotationHelper class.
     * @param {UIControls} uiControls 
     * @param {THREE.TrackballControls} trackballControls trackball controls
     */
    constructor(uiControls, trackballControls) {
        this.uiControls = uiControls
        RotationHelper.trackballControls = trackballControls
    }

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
    static rotateFace(rubiksCube, direction, color, swiping, keypressMode) {
        let origin = new THREE.Vector3(0, 0, 0)
        rubiksCube.isAnimated = true

        /**
         * Fast animation – rotation of pieces is instant
         */
        if (!swiping && (keypressMode == "Fast")) {
            for (let piece of rubiksCube.rotationGroups[color]) {
                if (direction == "ccw")
                    piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], Math.PI / 2)
                else
                    piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], -Math.PI / 2)
            }
        }
        /**
         * Slow animation – full rotation appears on screen
         */
        else if (!swiping && (keypressMode == "Slow")) {
            if (!this.doAnimate) {
                /**
                 * When isRotating is set to true, clicks/drags and other
                 * keybinds are ignored. If not, the cube will break if the user
                 * attempts to do either during an ongoing animation!
                 */
                rubiksCube.isRotating = true
                rubiksCube.isAnimated = true
                this.doAnimate = true

                let currentRotationAngle = 0.0
                let frameStep = 1 / 10

                /**
                 * step() increments the orientation of each of the pieces that
                 * make up a face by a fraction of a face rotation (+/-90 degreees)
                 * iff the cube has't already been rotated to +/-90 degrees,
                 * as checked through currentRotationAngle
                 */
                function step() {
                    currentRotationAngle += ((Math.PI / 2) * frameStep)
                    for (let piece of rubiksCube.rotationGroups[color]) {
                        if (direction == "ccw")
                            piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], ((Math.PI / 2) * frameStep))
                        else
                            piece.mesh.rotateAroundWorldAxis(origin, rubiksCube.rotationAxes[color], -((Math.PI / 2) * frameStep))
                    }

                    if (currentRotationAngle < Math.PI / 2) {
                        requestAnimationFrame(step)
                    } else {
                        rubiksCube.isRotating = false
                        rubiksCube.isAnimated = false
                    }
                }
                requestAnimationFrame(step)
                this.doAnimate = false
            }
        }

        this.rotateFaceInternal(rubiksCube, direction, color)
        rubiksCube.updateCoordinateHashmap()
        rubiksCube.cubeMap.populateCubeMap()
        rubiksCube.isAnimated = false

        if (rubiksCube.isShuffled && rubiksCube.isSolved())
            UIControls.congratulations()
    }

    /**
     * Corners belong to three outer layers at a time.
     * Edges belong to two outer layers and one inner layer at a time.
     * Centers belong to one outer layer and two inner layers at a time.
     */
    static rotateFaceInternal(rubiksCube, direction, color) {
        let rotationMap = null
        if (direction == "ccw")
            rotationMap = rubiksCube.counterclockwiseRotationMap
        else // direction == "cw"
            rotationMap = rubiksCube.clockwiseRotationMap

        for (let piece of rubiksCube.rotationGroups[color]) {

            if (piece.colors.length == 3) { // handling corner
                for (let i = 0; i < rotationMap[color].length; i++) {    
                    let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(rotationMap, color, piece, i)

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece) 
                        && rubiksCube.rotationGroups[adjacentFace].includes(piece)) {
                        this.updateCoordinates(piece, direction, color)
                        this.updateOrientationMap(rubiksCube, piece, direction, color)
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                        break
                    }
                }
            }
            
            else if (piece.colors.length == 2) { // handling edge
                for (let i = 0; i < rotationMap[color].length; i++) {
                    
                    let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(rotationMap, color, piece, i)

                    if (rubiksCube.rotationGroups[sourceFace].includes(piece)
                        && (adjacentFace == null || rubiksCube.rotationGroups[adjacentFace].includes(piece))) {
                        this.updateCoordinates(piece, direction, color)
                        this.updateOrientationMap(rubiksCube, piece, direction, color)
                        this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)

                        // Reassigning edge pieces to middle-layer rotation groups after outer-layer moves
                        if (color.charAt(1) != "#") {
                            let additionalRotationMap = null
                            if (direction == "cw")
                                additionalRotationMap = rubiksCube.clockwiseOuterToInnerRotationMap
                            else
                                additionalRotationMap = rubiksCube.counterclockwiseOuterToInnerRotationMap

                            let suffix = null
                            for (let color of piece.rotationGroups) {
                                if (color.charAt(1) == "#")
                                    suffix = color.charAt(color.length - 1)
                            }

                            for (let j = 0; j < additionalRotationMap[`${color}${suffix}`].length; j++) {
                                let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(additionalRotationMap, `${color}${suffix}`, piece, j)
                                if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                                    this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                                    break
                                }
                            }
                        }
                        break
                    }
                }

            }
            
            else { // handling center piece of face (piece.colors.length == 1)
                if (color.charAt(1) == "#") {
                    // reassigning center pieces to outer-layer rotation groups after middle-layer moves
                    for (let i = 0; i < rotationMap[color].length; i++) {
                        let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(rotationMap, color, piece, i)
                        if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                            this.updateCoordinates(piece, direction, color)
                            this.updateOrientationMap(rubiksCube, piece, direction, color)
                            this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                            
                            // additionally reassigning center pieces to middle-layer rotation groups after middle-layer moves
                            let additionalRotationMap = null
                            if (direction == "cw")
                                additionalRotationMap = rubiksCube.clockwiseInnerToInnerRotationMap
                            else
                                additionalRotationMap = rubiksCube.counterclockwiseInnerToInnerRotationMap

                            for (let j = 0; j < additionalRotationMap[color].length; j++) {
                                let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(additionalRotationMap, color, piece, j)

                                if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                                    this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                                    break
                                }
                            }
                            break
                        }
                    }

                }

                // additionally reassigning center pieces to middle-layer rotation groups after outer-layer moves
                else {
                    let additionalRotationMap = null
                    if (direction == "cw")
                        additionalRotationMap = rubiksCube.clockwiseCenterRotationMap
                    else
                        additionalRotationMap = rubiksCube.counterclockwiseCenterRotationMap

                    let suffix = null
                    for (let currentColor of piece.rotationGroups) {
                        if (currentColor.charAt(1) == "#" && currentColor != color)
                            suffix = currentColor.charAt(currentColor.length - 1)
                    }

                    /**
                     * Iterate through all of the pairs of middle-layer groups and find the one the piece belongs to
                     */
                    for (let j = 0; j < additionalRotationMap[`${color}${suffix}`].length; j++) {
                        let numMatches = 0
                        for (let l = 0; l < piece.rotationGroups.length; l++) {
                            if (piece.rotationGroups[l] == additionalRotationMap[`${color}${suffix}`][j][0] || piece.rotationGroups[l] == additionalRotationMap[`${color}${suffix}`][j][1] )
                                numMatches++
                        }
                        if (numMatches == 2) {
                            let [sourceFace, adjacentFace, destinationFace] = this.getSourceAdjacentAndDestinationFaces(additionalRotationMap, `${color}${suffix}`, piece, j)
                            
                            if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                                this.updateCoordinates(piece, direction, color)
                                this.updateOrientationMap(rubiksCube, piece, direction, color)
                                this.transferPiece(rubiksCube, piece, sourceFace, destinationFace)
                                break
                            }
                        }
                    }
                    
                }

            }
        }
    }

    
    static getSourceAdjacentAndDestinationFaces(rotationMap, color, piece, i) {
        let sourceFace = null, adjacentFace = null, destinationFace = null

        /* Corner - only involved in outer-layer rotation. */
        if (piece.colors.length == 3) {
            sourceFace = rotationMap[color][i]
            destinationFace = rotationMap[color][(i + 2) % 4]
            adjacentFace = rotationMap[color][(i + 1) % 4]
        }
        
        /* Edge - can be involved in outer-layer rotation or inner-layer */
        else if (piece.colors.length == 2) {
            if (color.charAt(1) == "#") { // middle layer
                sourceFace = rotationMap[color][i]
                destinationFace = rotationMap[color][(i + 2) % 4]
                adjacentFace = rotationMap[color][(i + 1) % 4]
            } else { // outer layer
                sourceFace = rotationMap[color][i]
                destinationFace = rotationMap[color][(i + 1) % 4]
            }
        } 
        
        /* Center - can be involved in outer-layer rotation or inner-layer */
        else {
            //console.log(rotationMap[color][i])
            //console.log(rotationMap[color][(i + 1) % 4])
            if (color.charAt(1) == "#") { // middle layer
                sourceFace = rotationMap[color][i]
                destinationFace = rotationMap[color][(i + 1) % 4]
            } else { // outer layer
                let firstState = rotationMap[color][i], secondState = rotationMap[color][(i + 1) % 4]

                if (firstState[0] == secondState[0]) {
                    sourceFace = firstState[1]
                    destinationFace = secondState[1]
                } else { // firstState[1] == secondState[1]
                    sourceFace = firstState[0]
                    destinationFace = secondState[0]
                }
            }
        }
        return [sourceFace, adjacentFace, destinationFace]
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
        for (let i = rubiksCube.rotationGroups[sourceFace].length - 1; i > -1; i--) {
            let currentPiece = rubiksCube.rotationGroups[sourceFace][i]
            if (currentPiece == piece) { // piece found

                // remove source face from rotationGroups array for piece
                for (let j = 0; j < piece.rotationGroups.length; j++) {
                    if (piece.rotationGroups[j] == sourceFace)
                        piece.rotationGroups.splice(j, 1)
                }

                rubiksCube.rotationGroups[sourceFace].splice(i, 1)
                break
            }
        }
        // add the piece from to the destination face array
        rubiksCube.rotationGroups[destinationFace].push(piece)

        // add destination face to rotationGroups array for piece
        piece.rotationGroups.push(destinationFace)
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
        let d = rubiksPiece.rubiksCube.dimension
        let rotationOrigins = {
            "W": [0, (d-1)/2, (d-1)/2],
            "B": [(d-1)/2, 0, (d-1)/2],
            "O": [(d-1)/2, (d-1)/2, d-1],
            "G": [(d-1)/2, d-1, (d-1)/2],
            "R": [(d-1)/2, (d-1)/2, 0],
            "Y": [(d-1), (d-1)/2, (d-1)/2],
            "W#Y1": [1, (d-1)/2, (d-1)/2],
            "W#Y2": [2, (d-1)/2, (d-1)/2],
            "W#Y3": [3, (d-1)/2, (d-1)/2],
            "B#G1": [(d-1)/2, 1, (d-1)/2],
            "B#G2": [(d-1)/2, 2, (d-1)/2],
            "B#G3": [(d-1)/2, 3, (d-1)/2],
            "R#O1": [(d-1)/2, (d-1)/2, 1],
            "R#O2": [(d-1)/2, (d-1)/2, 2],
            "R#O3": [(d-1)/2, (d-1)/2, 3],
        }

        let negativeAxisFaces = new Set([
            "R",
            "W",
            "B",
            "B#G1",
            "B#G2",
            "B#G3",
            "W#Y1",
            "W#Y2",
            "W#Y3",
            "R#O1",
            "R#O2",
            "R#O3"
        ])

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

        if (color == "W" || color == "Y" || color.startsWith("W#Y")) { // "x"
            rubiksPiece.coordinates[1] = Math.round(Math.abs(
                y*Math.cos(angle) - z*Math.sin(angle) + y0*(1 - Math.cos(angle)) + z0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[2] = Math.round(Math.abs(
                y*Math.sin(angle) + z*Math.cos(angle) + z0*(1 - Math.cos(angle)) - y0*Math.sin(angle)
            ))
        } else if (color == "G" || color == "B" || color.startsWith("B#G")) { // "y"
            rubiksPiece.coordinates[0] = Math.round(Math.abs(
                x*Math.cos(angle) + z*Math.sin(angle) + z0*(1 - Math.cos(angle)) - x0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[2] = Math.round(Math.abs(
                -x*Math.sin(angle) + z*Math.cos(angle) + x0*(1 - Math.cos(angle)) + z0*Math.sin(angle)
            ))
        } else { // "z"; color == "R" || color == "O" || color.startsWith("R#O")
            rubiksPiece.coordinates[0] = Math.round(Math.abs(
                x*Math.cos(angle) - y*Math.sin(angle) + x0*(1 - Math.cos(angle)) + y0*Math.sin(angle)
            ))
            rubiksPiece.coordinates[1] = Math.round(Math.abs(
                x*Math.sin(angle) + y*Math.cos(angle) + y0*(1 - Math.cos(angle)) - x0*Math.sin(angle)
            ))
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
        let rotationMap = null
        if (direction == "cw")
            rotationMap = rubiksCube.clockwiseRotationMap[color]
        else
            rotationMap = rubiksCube.counterclockwiseRotationMap[color]

        Object.entries(rubiksPiece.orientationMap).forEach((face) => {
            let currentPieceColor = face[0]
            let currentFaceLocation = face[1]

            if (currentFaceLocation != color) {
                for (let i = 0; i < rotationMap.length; i++) {
                    if (rotationMap[i] == currentFaceLocation) {
                        if (i + 1 <= rotationMap.length - 1)
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
