import * as THREE from "three";
import RubiksPiece from "./rubiks-piece";
import RubiksCube from "../rubiks-cube";
import UIControls from "../ui/ui-controls";

/**
 * Prototype for rotating an Object3D around an axis in world space by a specified
 * angle.
 *
 * Source: https://stackoverflow.com/a/32038265/17799976
 */
THREE.Object3D.prototype.rotateAroundWorldAxis = (function () {
    let q = new THREE.Quaternion();
    return function rotateAroundWorldAxis(point, axis, angle) {
        q.setFromAxisAngle(axis, angle);
        this.applyQuaternion(q);
        this.position.sub(point);
        this.position.applyQuaternion(q);
        this.position.add(point);
        return this;
    };
})();

/**
 * Class for handling updates of coordinates and coordinate maps (the cube's
 * internal representation) for individual RubiksPiece objects.
 *
 * Disclaimer: majority of functions/code in this class are comically inefficient.
 */
class RotationHelper {
    static currentRotationAnimationAngle = 0.0;
    static doAnimate = false;

    /**
     * Creates an instance of the RotationHelper class.
     * @param {UIControls} uiControls
     * @param {THREE.TrackballControls} trackballControls trackball controls
     */
    constructor(uiControls, trackballControls) {
        this.uiControls = uiControls;
        RotationHelper.trackballControls = trackballControls;
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
        let origin = new THREE.Vector3(0, 0, 0);
        rubiksCube.isAnimated = true;

        /**
         * Fast animation – rotation of pieces is instant.
         */
        if (!swiping && keypressMode == "Fast") {
            for (let piece of rubiksCube.rotationGroups[color]) {
                if (direction == "ccw")
                    piece.mesh.rotateAroundWorldAxis(
                        origin,
                        rubiksCube.rotationAxes[color],
                        Math.PI / 2,
                    );
                else
                    piece.mesh.rotateAroundWorldAxis(
                        origin,
                        rubiksCube.rotationAxes[color],
                        -Math.PI / 2,
                    );
            }
        } else if (!swiping && keypressMode == "Slow" && !this.doAnimate) {
            /**
             * Slow animation – full rotation appears on screen.
             */
            /**
             * When isRotating is set to true, clicks/drags and other
             * keybinds are ignored. If not, the cube will break if the user
             * attempts to do either during an ongoing animation!
             */
            rubiksCube.isRotating = true;
            rubiksCube.isAnimated = true;
            this.doAnimate = true;

            let currentRotationAngle = 0.0;
            let frameStep = 1 / 10;

            /**
             * step() increments the orientation of each of the pieces that
             * make up a face by a fraction of a face rotation (+/-90 degreees)
             * iff the cube has't already been rotated to +/-90 degrees,
             * as checked through currentRotationAngle
             */
            function step() {
                currentRotationAngle += (Math.PI / 2) * frameStep;
                for (let piece of rubiksCube.rotationGroups[color]) {
                    if (direction == "ccw")
                        piece.mesh.rotateAroundWorldAxis(
                            origin,
                            rubiksCube.rotationAxes[color],
                            (Math.PI / 2) * frameStep,
                        );
                    else
                        piece.mesh.rotateAroundWorldAxis(
                            origin,
                            rubiksCube.rotationAxes[color],
                            -((Math.PI / 2) * frameStep),
                        );
                }

                if (currentRotationAngle < Math.PI / 2) {
                    requestAnimationFrame(step);
                } else {
                    rubiksCube.isRotating = false;
                    rubiksCube.isAnimated = false;
                }
            }
            requestAnimationFrame(step);
            this.doAnimate = false;
        }
        this.rotateFaceInternal(rubiksCube, direction, color);
        rubiksCube.updateCoordinateHashmap();
        rubiksCube.cubeMap.populateCubeMap();
        rubiksCube.isAnimated = false;

        if (rubiksCube.isShuffled && rubiksCube.isSolved())
            UIControls.congratulations();
    }

    /**
     * Corners belong to three outer layers at a time.
     * Edges belong to two outer layers and one inner layer at a time.
     * Centers belong to one outer layer and two inner layers at a time.
     */
    static rotateFaceInternal(rubiksCube, direction, color) {
        let rotationMap = null;
        if (direction == "ccw")
            rotationMap = rubiksCube.counterclockwiseOuterRotationMap; // direction == "cw"
        else rotationMap = rubiksCube.clockwiseOuterRotationMap;

        for (let piece of rubiksCube.rotationGroups[color]) {
            this.rotateFaceCorner(
                piece,
                rotationMap,
                rubiksCube,
                direction,
                color,
            );
            this.rotateFaceEdge(
                piece,
                rotationMap,
                rubiksCube,
                direction,
                color,
            );
            this.rotateFaceCenter(
                piece,
                rotationMap,
                rubiksCube,
                direction,
                color,
            );
        }
    }

    static rotateFaceCorner(piece, rotationMap, rubiksCube, direction, color) {
        if (piece.colors.length == 3) {
            // reassigning corners to outer-layer groups after outer-layer moves
            for (let i = 0; i < rotationMap[color].length; i++) {
                let [
                    sourceFace,
                    sourceFace2,
                    adjacentFace,
                    destinationFace,
                    destinationFace2,
                ] = this.getSourceAdjacentAndDestinationFaces(
                    rotationMap,
                    color,
                    piece,
                    i,
                );

                if (
                    rubiksCube.rotationGroups[sourceFace].includes(piece) &&
                    rubiksCube.rotationGroups[adjacentFace].includes(piece)
                ) {
                    this.updateCoordinates(piece, direction, color);
                    this.updateOrientationMap(
                        rubiksCube,
                        piece,
                        direction,
                        color,
                    );
                    this.transferPiece(
                        rubiksCube,
                        piece,
                        sourceFace,
                        destinationFace,
                    );
                    break;
                }
            }
        }
    }

    static rotateFaceEdge(piece, rotationMap, rubiksCube, direction, color) {
        if (piece.colors.length == 2) {
            for (let i = 0; i < rotationMap[color].length; i++) {
                /**
                 * Reassigning edge pieces to outer-layer rotation groups after outer-layer
                 * moves or reassigning edge pieces to outer-layer rotation groups after
                 * inner-layer moves.
                 */
                let [
                    sourceFace,
                    sourceFace2,
                    adjacentFace,
                    destinationFace,
                    destinationFace2,
                ] = this.getSourceAdjacentAndDestinationFaces(
                    rotationMap,
                    color,
                    piece,
                    i,
                );

                if (
                    rubiksCube.rotationGroups[sourceFace].includes(piece) &&
                    (adjacentFace == null ||
                        rubiksCube.rotationGroups[adjacentFace].includes(piece))
                ) {
                    this.updateCoordinates(piece, direction, color);
                    this.updateOrientationMap(
                        rubiksCube,
                        piece,
                        direction,
                        color,
                    );
                    this.transferPiece(
                        rubiksCube,
                        piece,
                        sourceFace,
                        destinationFace,
                    );

                    // reassigning edge pieces to inner-layer rotation groups after outer-layer moves
                    if (color.charAt(1) != "#") {
                        let additionalRotationMap = null;
                        if (direction == "cw")
                            additionalRotationMap =
                                rubiksCube.clockwiseOuterToInnerRotationMap;
                        else
                            additionalRotationMap =
                                rubiksCube.counterclockwiseOuterToInnerRotationMap;

                        let suffix = null;
                        for (let color of piece.rotationGroups) {
                            if (color.charAt(1) == "#")
                                suffix = color.charAt(color.length - 1);
                        }

                        for (
                            let j = 0;
                            j <
                            additionalRotationMap[`${color}${suffix}`].length;
                            j++
                        ) {
                            let [
                                sourceFace,
                                sourceFace2,
                                adjacentFace,
                                destinationFace,
                                destinationFace2,
                            ] = this.getSourceAdjacentAndDestinationFaces(
                                additionalRotationMap,
                                `${color}${suffix}`,
                                piece,
                                j,
                            );
                            if (
                                rubiksCube.rotationGroups[sourceFace].includes(
                                    piece,
                                )
                            ) {
                                this.transferPiece(
                                    rubiksCube,
                                    piece,
                                    sourceFace,
                                    destinationFace,
                                );
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    static rotateFaceCenter(piece, rotationMap, rubiksCube, direction, color) {
        if (piece.colors.length == 1) {
            // handling center piece of face (piece.colors.length == 1)
            if (color.charAt(1) == "#") {
                // reassigning center pieces to outer-layer rotation groups after middle-layer moves
                for (let i = 0; i < rotationMap[color].length; i++) {
                    let [
                        sourceFace,
                        sourceFace2,
                        adjacentFace,
                        destinationFace,
                        destinationFace2,
                    ] = this.getSourceAdjacentAndDestinationFaces(
                        rotationMap,
                        color,
                        piece,
                        i,
                    );
                    if (rubiksCube.rotationGroups[sourceFace].includes(piece)) {
                        //this.updateCoordinates(piece, direction, color);
                        this.updateOrientationMap(
                            rubiksCube,
                            piece,
                            direction,
                            color,
                        );
                        this.transferPiece(
                            rubiksCube,
                            piece,
                            sourceFace,
                            destinationFace,
                        );

                        /**
                         * TODO: generate rotation map for middle-layer
                         * group reassignments after middle-layer movements.
                         */
                        let additionalRotationMap =
                            this.getCenterRotationMapInner(
                                rubiksCube,
                                piece,
                                color,
                                direction,
                            );

                        this.updateCoordinates(piece, direction, color);

                        for (let j = 0; j < additionalRotationMap.length; j++) {
                            let [
                                sourceFace,
                                sourceFace2,
                                adjacentFace,
                                destinationFace,
                                destinationFace2,
                            ] = this.getSourceAdjacentAndDestinationFaces(
                                additionalRotationMap,
                                color,
                                piece,
                                j,
                            );

                            if (
                                rubiksCube.rotationGroups[sourceFace].includes(
                                    piece,
                                )
                            ) {
                                this.transferPiece(
                                    rubiksCube,
                                    piece,
                                    sourceFace,
                                    destinationFace,
                                );
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            // reassigning center pieces to middle-layer rotation groups after outer-layer moves
            else {
                let additionalRotationMap = this.getCenterRotationMapOuter(
                    rubiksCube,
                    piece,
                    color,
                    direction,
                );

                /**
                 * Iterate through all of the pairs of middle-layer groups and find the one the piece belongs to
                 */
                for (let j = 0; j < additionalRotationMap.length; j++) {
                    let numMatches = 0;
                    for (let l = 0; l < piece.rotationGroups.length; l++) {
                        if (
                            piece.rotationGroups[l] ==
                                additionalRotationMap[j][0] ||
                            piece.rotationGroups[l] ==
                                additionalRotationMap[j][1]
                        )
                            numMatches++;
                    }
                    if (numMatches == 2) {
                        let [
                            sourceFace,
                            sourceFace2,
                            adjacentFace,
                            destinationFace,
                            destinationFace2,
                        ] = this.getSourceAdjacentAndDestinationFaces(
                            additionalRotationMap,
                            color,
                            piece,
                            j,
                        );

                        // must be multiple source and destination faces to
                        // account for another edge case with the center pieces

                        if (
                            rubiksCube.rotationGroups[sourceFace].includes(
                                piece,
                            )
                        ) {
                            this.updateCoordinates(piece, direction, color);
                            this.updateOrientationMap(
                                rubiksCube,
                                piece,
                                direction,
                                color,
                            );
                            this.transferPiece(
                                rubiksCube,
                                piece,
                                sourceFace,
                                destinationFace,
                            );
                            if (sourceFace2 && destinationFace2) {
                                this.transferPiece(
                                    rubiksCube,
                                    piece,
                                    sourceFace2,
                                    destinationFace2,
                                );
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    static getCenterRotationMapOuter(rubiksCube, piece, color, direction) {
        /**
         * Get the rotation groups that would change with the given
         * color movement that act as "axes"
         */
        let startCoords = [];
        for (
            let i = 0;
            i < rubiksCube.centerRotationMapCoordinates[color].length;
            i++
        ) {
            for (let j = 0; j < piece.rotationGroups.length; j++) {
                if (
                    piece.rotationGroups[j].substring(
                        0,
                        piece.rotationGroups[j].length - 1,
                    ) == rubiksCube.centerRotationMapCoordinates[color][i]
                ) {
                    startCoords.push(piece.rotationGroups[j]);
                }
            }
        }

        let d = rubiksCube.dimension;
        let rotationOrigin = [(d - 1) / 2, (d - 1) / 2];

        let startingPointX = parseInt(
            startCoords[0].charAt(startCoords[0].length - 1),
        );
        let startingPointY = parseInt(
            startCoords[1].charAt(startCoords[1].length - 1),
        );

        let angle = 0;
        let rotationMap = [];
        for (let i = 0; i < 4; i++) {
            let pointX = Math.round(
                startingPointX * Math.cos(angle) -
                    startingPointY * Math.sin(angle) +
                    rotationOrigin[0] * (1 - Math.cos(angle)) +
                    rotationOrigin[1] * Math.sin(angle),
            );

            let pointY = Math.round(
                startingPointX * Math.sin(angle) +
                    startingPointY * Math.cos(angle) +
                    rotationOrigin[1] * (1 - Math.cos(angle)) -
                    rotationOrigin[0] * Math.sin(angle),
            );

            rotationMap.push([
                `${startCoords[0].substring(0, startCoords[0].length - 1)}${pointX}`,
                `${startCoords[1].substring(0, startCoords[1].length - 1)}${pointY}`,
            ]);
            if (direction == "ccw")
                angle -= Math.PI / 2; // direction == "cw"
            else angle += Math.PI / 2;
        }

        // reverse the map if on a "negative-axis" face (yellow, green, or orange)
        if (color == "W" || color == "G" || color == "R") {
            //return rotationMap.reverse();
            rotationMap = rotationMap.reverse();
            return rotationMap;
        } else return rotationMap;
    }

    static getCenterRotationMapInner(rubiksCube, piece, color, direction) {
        /**
         * Get the rotation groups that would change with the given
         * color movement that act as "axes"
         */
        let startCoords = [];
        for (
            let i = 0;
            i <
            rubiksCube.centerRotationMapCoordinates[
                color.substring(0, color.length - 1)
            ].length;
            i++
        ) {
            let isAdded = 0;
            for (let j = 0; j < piece.rotationGroups.length; j++) {
                if (
                    piece.rotationGroups[j].substring(
                        0,
                        piece.rotationGroups[j].length - 1,
                    ) ==
                    rubiksCube.centerRotationMapCoordinates[
                        color.substring(0, color.length - 1)
                    ][i]
                ) {
                    startCoords.push(piece.rotationGroups[j]);
                    isAdded += 1;
                }
            }
            if (!isAdded) {
                if (
                    rubiksCube.centerRotationMapCoordinates[
                        color.substring(0, color.length - 1)
                    ][i] == "W#Y"
                ) {
                    startCoords.push(
                        `${rubiksCube.centerRotationMapCoordinates[color.substring(0, color.length - 1)][i]}${piece.coordinates[0]}`,
                    );
                } else if (
                    rubiksCube.centerRotationMapCoordinates[
                        color.substring(0, color.length - 1)
                    ][i] == "B#G"
                ) {
                    startCoords.push(
                        `${rubiksCube.centerRotationMapCoordinates[color.substring(0, color.length - 1)][i]}${piece.coordinates[1]}`,
                    );
                } else {
                    startCoords.push(
                        `${rubiksCube.centerRotationMapCoordinates[color.substring(0, color.length - 1)][i]}${piece.coordinates[2]}`,
                    );
                }
            }
        }

        let d = rubiksCube.dimension;
        let rotationOrigin = [(d - 1) / 2, (d - 1) / 2];

        let startingPointX = parseInt(
            startCoords[0].charAt(startCoords[0].length - 1),
        );
        let startingPointY = parseInt(
            startCoords[1].charAt(startCoords[1].length - 1),
        );

        let angle = 0;
        let rotationMap = [];
        for (let i = 0; i < 4; i++) {
            let pointX = Math.round(
                Math.abs(
                    startingPointX * Math.cos(angle) -
                        startingPointY * Math.sin(angle) +
                        rotationOrigin[0] * (1 - Math.cos(angle)) +
                        rotationOrigin[1] * Math.sin(angle),
                ),
            );

            let pointY = Math.round(
                Math.abs(
                    startingPointX * Math.sin(angle) +
                        startingPointY * Math.cos(angle) +
                        rotationOrigin[1] * (1 - Math.cos(angle)) -
                        rotationOrigin[0] * Math.sin(angle),
                ),
            );

            rotationMap.push([
                `${startCoords[0].substring(0, startCoords[0].length - 1)}${pointX}`,
                `${startCoords[1].substring(0, startCoords[1].length - 1)}${pointY}`,
            ]);
            if (direction == "ccw")
                angle -= Math.PI / 2; // direction == "cw"
            else angle += Math.PI / 2;
        }

        // reverse the map if on a "negative-axis" face (yellow, green, or orange)
        if (color.startsWith("R#O") || color.startsWith("W#Y")) {
            rotationMap = rotationMap.reverse();
            return rotationMap;
        } else {
            return rotationMap;
        }
    }

    static getSourceAdjacentAndDestinationFaces(rotationMap, color, piece, i) {
        let sourceFace1 = null,
            sourceFace2 = null,
            adjacentFace = null,
            destinationFace1 = null,
            destinationFace2 = null;

        /* Corner - only involved in outer-layer rotation. */
        if (piece.colors.length == 3) {
            sourceFace1 = rotationMap[color][i];
            destinationFace1 = rotationMap[color][(i + 2) % 4];
            adjacentFace = rotationMap[color][(i + 1) % 4];
        } else if (piece.colors.length == 2) {

        /* Edge - can be involved in outer-layer rotation or inner-layer */
            if (color.charAt(1) == "#") {
                // middle layer
                sourceFace1 = rotationMap[color][i];
                destinationFace1 = rotationMap[color][(i + 2) % 4];
                adjacentFace = rotationMap[color][(i + 1) % 4];
            } else {
                // outer layer
                sourceFace1 = rotationMap[color][i];
                destinationFace1 = rotationMap[color][(i + 1) % 4];
            }
        } else {

        /* Center - can be involved in outer-layer rotation or inner-layer */
            if (color.charAt(1) == "#") {
                // middle layer
                if (rotationMap.constructor == Object) {
                    sourceFace1 = rotationMap[color][i];
                    destinationFace1 = rotationMap[color][(i + 1) % 4];
                } else {
                    let firstState = rotationMap[i],
                        secondState = rotationMap[(i + 1) % 4];

                    if (
                        firstState[0] == secondState[0] &&
                        firstState[1] == secondState[1]
                    ) {
                        if (piece.rotationGroups.includes(firstState[0])) {
                            sourceFace1 = firstState[0];
                            destinationFace1 = secondState[1];
                        } else {
                            // !piece.rotationGroups.includes(firstState[0])
                            sourceFace1 = secondState[1];
                            destinationFace1 = firstState[0];
                        }
                    } else if (firstState[0] == secondState[0]) {
                        sourceFace1 = firstState[1];
                        destinationFace1 = secondState[1];
                    } else if (firstState[1] == secondState[1]) {
                        sourceFace1 = firstState[0];
                        destinationFace1 = secondState[0];
                    } else {
                        for (let coord of firstState) {
                            if (
                                coord.charAt(coord.length - 1) != "0" &&
                                coord.charAt(coord.length - 1) !=
                                    `${piece.rubiksCube.dimension - 1}`
                            ) {
                                sourceFace1 = coord;
                            }
                        }
                        for (let coord of secondState) {
                            if (
                                coord.charAt(coord.length - 1) != "0" &&
                                coord.charAt(coord.length - 1) !=
                                    `${piece.rubiksCube.dimension - 1}`
                            ) {
                                destinationFace1 = coord;
                            }
                        }
                    }
                }
            } else {
                // outer layer
                let firstState = rotationMap[i],
                    secondState = rotationMap[(i + 1) % 4];

                if (firstState[0] == secondState[0]) {
                    sourceFace1 = firstState[1];
                    destinationFace1 = secondState[1];
                } else if (firstState[1] == secondState[1]) {
                    sourceFace1 = firstState[0];
                    destinationFace1 = secondState[0];
                } else {
                    // firstState[0] != secondState[0] && firstState[1] != secondState[1]
                    ((sourceFace1 = firstState[0]),
                        (sourceFace2 = firstState[1]));
                    ((destinationFace1 = secondState[0]),
                        (destinationFace2 = secondState[1]));
                }
            }
        }
        return [
            sourceFace1,
            sourceFace2,
            adjacentFace,
            destinationFace1,
            destinationFace2,
        ];
    }

    /**
     * Helper function that transfers a given RubikePiece object from one
     * face's array to another face's array.
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
        for (
            let i = rubiksCube.rotationGroups[sourceFace].length - 1;
            i > -1;
            i--
        ) {
            let currentPiece = rubiksCube.rotationGroups[sourceFace][i];
            if (currentPiece == piece) {
                // piece found

                // remove source face from rotationGroups array for piece
                for (let j = 0; j < piece.rotationGroups.length; j++) {
                    if (piece.rotationGroups[j] == sourceFace)
                        piece.rotationGroups.splice(j, 1);
                }

                rubiksCube.rotationGroups[sourceFace].splice(i, 1);
                break;
            }
        }
        // add the piece from to the destination face array
        rubiksCube.rotationGroups[destinationFace].push(piece);

        // add destination face to rotationGroups array for piece
        piece.rotationGroups.push(destinationFace);
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
        let d = rubiksPiece.rubiksCube.dimension;
        let rotationOrigins = {
            W: [0, (d - 1) / 2, (d - 1) / 2],
            B: [(d - 1) / 2, 0, (d - 1) / 2],
            O: [(d - 1) / 2, (d - 1) / 2, d - 1],
            G: [(d - 1) / 2, d - 1, (d - 1) / 2],
            R: [(d - 1) / 2, (d - 1) / 2, 0],
            Y: [d - 1, (d - 1) / 2, (d - 1) / 2],
            "W#Y1": [1, (d - 1) / 2, (d - 1) / 2],
            "W#Y2": [2, (d - 1) / 2, (d - 1) / 2],
            "W#Y3": [3, (d - 1) / 2, (d - 1) / 2],
            "B#G1": [(d - 1) / 2, 1, (d - 1) / 2],
            "B#G2": [(d - 1) / 2, 2, (d - 1) / 2],
            "B#G3": [(d - 1) / 2, 3, (d - 1) / 2],
            "R#O1": [(d - 1) / 2, (d - 1) / 2, 1],
            "R#O2": [(d - 1) / 2, (d - 1) / 2, 2],
            "R#O3": [(d - 1) / 2, (d - 1) / 2, 3],
        };

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
            "R#O3",
        ]);

        let x = rubiksPiece.coordinates[0];
        let y = rubiksPiece.coordinates[1];
        let z = rubiksPiece.coordinates[2];
        let x0 = rotationOrigins[color][0];
        let y0 = rotationOrigins[color][1];
        let z0 = rotationOrigins[color][2];

        let angle = Math.PI / 2; // 90 degrees counterclockwise
        if (
            (negativeAxisFaces.has(color) && direction == "cw") ||
            (!negativeAxisFaces.has(color) && direction == "ccw")
        ) {
            angle = Math.PI / 2;
        } else {
            angle = -Math.PI / 2;
        }

        if (color == "W" || color == "Y" || color.startsWith("W#Y")) {
            // "x"
            rubiksPiece.coordinates[1] = Math.round(
                Math.abs(
                    y * Math.cos(angle) -
                        z * Math.sin(angle) +
                        y0 * (1 - Math.cos(angle)) +
                        z0 * Math.sin(angle),
                ),
            );
            rubiksPiece.coordinates[2] = Math.round(
                Math.abs(
                    y * Math.sin(angle) +
                        z * Math.cos(angle) +
                        z0 * (1 - Math.cos(angle)) -
                        y0 * Math.sin(angle),
                ),
            );
        } else if (color == "G" || color == "B" || color.startsWith("B#G")) {
            // "y"
            rubiksPiece.coordinates[0] = Math.round(
                Math.abs(
                    x * Math.cos(angle) +
                        z * Math.sin(angle) +
                        z0 * (1 - Math.cos(angle)) -
                        x0 * Math.sin(angle),
                ),
            );
            rubiksPiece.coordinates[2] = Math.round(
                Math.abs(
                    -x * Math.sin(angle) +
                        z * Math.cos(angle) +
                        x0 * (1 - Math.cos(angle)) +
                        z0 * Math.sin(angle),
                ),
            );
        } else {
            // "z"; color == "R" || color == "O" || color.startsWith("R#O")
            rubiksPiece.coordinates[0] = Math.round(
                Math.abs(
                    x * Math.cos(angle) -
                        y * Math.sin(angle) +
                        x0 * (1 - Math.cos(angle)) +
                        y0 * Math.sin(angle),
                ),
            );
            rubiksPiece.coordinates[1] = Math.round(
                Math.abs(
                    x * Math.sin(angle) +
                        y * Math.cos(angle) +
                        y0 * (1 - Math.cos(angle)) -
                        x0 * Math.sin(angle),
                ),
            );
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
        // TODO: update this?
        let rotationMap = null;
        if (direction == "cw")
            rotationMap = rubiksCube.clockwiseOuterRotationMap[color];
        else rotationMap = rubiksCube.counterclockwiseOuterRotationMap[color];

        Object.entries(rubiksPiece.orientationMap).forEach((face) => {
            let currentPieceColor = face[0];
            let currentFaceLocation = face[1];

            if (currentFaceLocation != color) {
                for (let i = 0; i < rotationMap.length; i++) {
                    if (rotationMap[i] == currentFaceLocation) {
                        if (i + 1 <= rotationMap.length - 1)
                            rubiksPiece.orientationMap[currentPieceColor] =
                                rotationMap[i + 1];
                        else
                            rubiksPiece.orientationMap[currentPieceColor] =
                                rotationMap[0];
                    }
                }
            }
        });
    }
}

export default RotationHelper;
