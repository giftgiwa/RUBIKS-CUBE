import * as THREE from 'three'
import RubiksPiece from './rubiks-piece'
import RotationHelper from './rubiks-rotation-helper'

/**
 * Helper function for inserting elements into arrays at specified indices
 * Source: https://stackoverflow.com/questions/586182/how-can-i-insert-an-item-into-an-array-at-a-specific-index
 */
Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};

/**
 * Class for storing a Rubik's Cube instantiated in the scene (for both internal
 * and external representation).
 */
class RubiksCube {

    /**
     * lists complementary faces on rubiks cube (i.e. faces that exist on
     * opposite sides of the cube, such as the blue and green face).
     */
    //complements = {
    //    'W': 'Y', 'Y': 'W',
    //    'O': 'R', 'R': 'O',
    //    'B': 'G', 'G': 'B'
    //}

    /**
     * Lists the ordering of faces adjacent to each face in the clockwise 
     * direction (for handling rotations).
     * 
     * For example for the white face, the faces adjacent to it are the blue, 
     * red, green, and orange faces. If the white side of the cube were rotated 
     * clockwise, the pieces would move from the blue face to the red face, the
     * red face to the green face, and so on.
     */
    clockwiseRotationMap = {
        'W': ['B', 'R', 'G', 'O'],
        'B': ['W', 'O', 'Y', 'R'],
        'O': ['W', 'G', 'Y', 'B'],
        'G': ['W', 'R', 'Y', 'O'],
        'R': ['W', 'B', 'Y', 'G'],
        'Y': ['B', 'O', 'G', 'R'],
        'W#Y1': ['B', 'R', 'G', 'O'],
        'W#Y2': ['B', 'R', 'G', 'O'],
        'W#Y3': ['B', 'R', 'G', 'O'],
        'B#G1': ['W', 'O', 'Y', 'R'],
        'B#G2': ['W', 'O', 'Y', 'R'],
        'B#G3': ['W', 'O', 'Y', 'R'],
        'R#O1': ['W', 'B', 'Y', 'G'],
        'R#O2': ['W', 'B', 'Y', 'G'],
        'R#O3': ['W', 'B', 'Y', 'G']
    }

    /**
     * Lists the ordering of faces in the clockwise direction (for
     * handling rotations).
     * 
     * For example, for the white face, the faces adjacent to it are the blue, 
     * orange, green, and red faces. If the white side of the cube were rotated 
     * counterclockwise, the pieces would move from the blue face to the red
     * face, the red face to the green face, and so on.
     */
    counterclockwiseRotationMap = {
        'W': ['B', 'O', 'G', 'R'],
        'B': ['W', 'R', 'Y', 'O'],
        'O': ['W', 'B', 'Y', 'G'],
        'G': ['W', 'O', 'Y', 'R'],
        'R': ['W', 'G', 'Y', 'B'],
        'Y': ['B', 'R', 'G', 'O'],
        'W#Y1': ['B', 'O', 'G', 'R'],
        'W#Y2': ['B', 'O', 'G', 'R'],
        'W#Y3': ['B', 'O', 'G', 'R'],
        'B#G1': ['W', 'R', 'Y', 'O'],
        'B#G2': ['W', 'R', 'Y', 'O'],
        'B#G3': ['W', 'R', 'Y', 'O'],
        'R#O1': ['W', 'G', 'Y', 'B'],
        'R#O2': ['W', 'G', 'Y', 'B'],
        'R#O3': ['W', 'G', 'Y', 'B']
    }

    /**
     * Stores the RubiksPiece objects associated with each face in the Rubik's
     * cube. The keys are faces identified by color, and the values are arrays
     * of RubiksPiece objects. These arrays are used to rotate faces as groups.
     */
    rotationGroups = {
        'W': [],
        'B': [],
        'O': [],
        'G': [],
        'R': [],
        'Y': [],
    }

    /**
     * Hashmap that stores the axes around which each face rotates. Complementary
     * faces (white and yellow, red and orange, blue and green) have axes with
     * the same directions, but opposite signs.
     */
    rotationAxes = {
        'W': new THREE.Vector3(0, 1, 0), /* y */
        'B': new THREE.Vector3(0, 0, 1), /* z */
        'O': new THREE.Vector3(1, 0, 0), /* x */
        'G': new THREE.Vector3(0, 0, -1), /* -z */
        'R': new THREE.Vector3(-1, 0, 0), /* -x */
        'Y': new THREE.Vector3(0, -1, 0), /* -y */
        'W#Y1': new THREE.Vector3(0, 1, 0), /* y */
        'W#Y2': new THREE.Vector3(0, 1, 0), /* y */
        'W#Y3': new THREE.Vector3(0, 1, 0), /* y */
        'B#G1': new THREE.Vector3(0, 0, 1), /* z */
        'B#G2': new THREE.Vector3(0, 0, 1), /* z */
        'B#G3': new THREE.Vector3(0, 0, 1), /* z */
        'R#O1': new THREE.Vector3(-1, 0, 0), /* -x */
        'R#O2': new THREE.Vector3(-1, 0, 0), /* -x */
        'R#O3': new THREE.Vector3(-1, 0, 0), /* -x */
    }

    /**
     * Constructor for RubiksCube class. The rotationGroups hash map and
     * coordinateMap array get initially populated based on the initial
	 * positions and orientations of the Rubik's cube pieces (which would be the
	 * solved state of the cube).
	 *
     * @param {*} gltf actual GLTF file imported into the THREE.js Scene
     */
    constructor(gltf, dimension, collisionCube) {
        this.gltf = gltf // store the model file

		/**
		 * Initialize member variables to indicating the cube's dimensions,
         * that the Rubik's cube isn't rotating, isn't shuffling, isn't set to
         * animate a rotation, doesn't have its cube map initialized, and hasn't
         * been shuffled yet.
		 */
        this.dimension = dimension
        this.isRotating = false
        this.isShuffling = false
        this.isAnimated = false
        this.cubeMap = null
        this.isShuffled = false
        this.collisionCube = collisionCube
        this.isRendered = false

        this.getMovesAndRotationGroups()
        this.generateSolvedState()
        this.initCoordinateMap() // build the coordinate map
        this.buildMeshGroups() // build the mesh groups
        this.updateCoordinateHashmap()
    }

    /**
     * Creates a list of possible moves for the user to make depending on the
     * dimensions of the cube
     */
    getMovesAndRotationGroups() {
        /**
         * Add additional rotation group keys (for middle wedge pieces
         * in cubes bigger than 2x2)
         */
        let wedgeKeys = ["W#Y", "B#G", "R#O"]
        for (let i = 1; i <= this.dimension - 2; i++) {
            for (let j = 0; j < wedgeKeys.length; j++)
                this.rotationGroups[`${wedgeKeys[j]}${i}`] = []
        }

        // add wedge piece moves (for cubes bigger than 2x2)
        this.moves = []
        for (const [key, _] of Object.entries(this.rotationGroups)) {
            if (key.length == 1) { // outer faces
                this.moves.push(`${key}***|cw`)
                this.moves.push(`${key}***|ccw`)
            } else { // middle wedges (for cubes largeer than 2x2)
                this.moves.push(`${key}|cw`)
                this.moves.push(`${key}|ccw`)
            }
        }
    }

    /**
     * "Parse" the Rubik's cube in its default state for 
     * its data structure representation.
     */
    initCoordinateMap() {
        /**
         * Each of the double/triple/quadruple/quintuple/whatever -nested arrays
         * will store the colors of the given piece.
         */
        this.coordinateMap = []
        for (let i = 0; i < this.dimension; i++) {
            let arr = []
            for (let j = 0; j < this.dimension; j++) {
                arr.push(new Array(this.dimension))
            }
            this.coordinateMap.push(arr)
        }

        /**
         * NOTE:
         * * All of the pieces in the mesh are being iterated through
         *   (which excludes the "null center piece" in the middle layer).
         * * There should be (and are) 8 corner pieces, 12 edge pieces, and 6
         *   face pieces.
         */
        for (let i = 0; i < this.gltf.children.length; i++) {
            let currentPiece = this.gltf.children[i]
            //currentPiece.updateMatrixWorld(true);

            let x = Number(currentPiece.name[0])
            let y = Number(currentPiece.name[1])
            let z = Number(currentPiece.name[2])

            /**
             * RubiksPiece(colors, coordinates, orientationMap, mesh)
             */
            if (this.solvedStateOrientations[x][y][z] != null) {
                let colors = Object.keys(this.solvedStateOrientations[x][y][z])
                let currentOrientationMap = this.solvedStateOrientations[x][y][z]

                this.coordinateMap[x][y][z] = new RubiksPiece(
                    colors, /* colors */
                    [x, y, z], /* coordinates */
                    currentOrientationMap, /* orientaton map */
                    currentPiece, /* mesh (within GLTF file) */
                    this /* backpointer to current instance of cube */
                )
            }
        }
    }

    /**
     * Assign the Rubik's Cube pieces into groups for face rotations.
     */
    buildMeshGroups() {
        /**
         * Note on face assignments for each Rubik's Cube state:
         * 
         * white face: "x"/"i" coordinate == 0
         * yellow face: "x"/"i" coordinate == 2
         * blue face: "y"/"j" coordinate == 0
         * green face: "y"/"j" coordinate == 2
         * red face: "z"/"k" coordinate == 0
         * orange face: "z"/"k" coordinate == 2
         */
        for (let i = 0; i < this.coordinateMap.length; i++) {
            for (let j = 0; j < this.coordinateMap[0].length; j++) {
                for (let k = 0; k < this.coordinateMap[0][0].length; k++) {
                    if (this.coordinateMap[i][j][k]) {
                        if (i == 0) this.rotationGroups["W"].push(this.coordinateMap[i][j][k]) // white
                        if (i == this.dimension - 1) this.rotationGroups["Y"].push(this.coordinateMap[i][j][k]) // yellow
                        if (j == 0) this.rotationGroups["B"].push(this.coordinateMap[i][j][k]) // blue
                        if (j == this.dimension - 1) this.rotationGroups["G"].push(this.coordinateMap[i][j][k]) // green
                        if (k == 0) this.rotationGroups["R"].push(this.coordinateMap[i][j][k]) // red
                        if (k == this.dimension - 1) this.rotationGroups["O"].push(this.coordinateMap[i][j][k]) // orange

                        if (i > 0 && i < this.dimension - 1) {
                            this.rotationGroups[`W#Y${i}`].push(this.coordinateMap[i][j][k]) // white/yellow
                        }
                        if (j > 0 && j < this.dimension - 1) {
                            this.rotationGroups[`B#G${j}`].push(this.coordinateMap[i][j][k]) // blue/green
                        }
                        if (k > 0 && k < this.dimension - 1) {
                            this.rotationGroups[`R#O${k}`].push(this.coordinateMap[i][j][k]) // blue/green
                        }
                    }
                }
            }
        }

    }

    /**
     * Shuffle the Rubik's cube
     * @param {*} rubiksCube 
     * @param {*} keypressMode Whether the rotation animation is instant or slow.
     * @param {*} shuffleButton 
     */
    shuffle(rubiksCube, keypressMode, shuffleButton) {
        this.isShuffling = true
        let previousMove = null
        let moves = []

        let numMoves = 0
        while (numMoves < 40) {
            let currentMove = this.moves[Math.floor(Math.random() * this.moves.length)]

            // TODO: handle logic for removing the "*" check in the if block (by accounting for cubes with >3x3 dimensions)
            if (previousMove != currentMove && currentMove.includes("*")) {
                let color = currentMove.substring(0, 1)
                let direction = currentMove.substring(5)

                previousMove = currentMove
                numMoves += 1
                moves.push([color, direction])
            }
        }

        /**
         * The animateMove() helper function recursively calls itself while
         * updating a counter variable until it reaches the desired number of
         * moves animated in the Rubik's Cube. This serves as an 
         * alternative to using a for loop that repeatedly calls rotateFace()
         * to account for the asynchronous nature of the rotations of the faces.
         */
        let i = 0
        function animateMove() {
            setTimeout(() => {
                RotationHelper.rotateFace(
                    rubiksCube, moves[i][1], moves[i][0], false, keypressMode
                )

                i += 1
                if (i == moves.length) {
                    rubiksCube.isShuffling = false
                    
                    shuffleButton.disabled = false
                    shuffleButton.style.borderColor = "#000"
                    shuffleButton.style.color = "#000"
                    shuffleButton.style.cursor = "pointer"
                    rubiksCube.isShuffled = true
                    return
                }

                animateMove()
            }, keypressMode == "Fast" ? 100 : 400)
        }
        animateMove()
    }

    /**
     * Generates an intial state for Rubik's cube (used for initialization of
     * coordinate map)
     * 
     * keys: color(s) of face/edge/corner
     * values: face that specific color(s) reside on
     * 
     * e.g. If a yellow/blue/red corner were to reside on the corner between
     *      the white, red, and blue faces such that the yellow tile is on
     *      the white face, the red tile
     * 
     * Since the coordinateMap has the indices of each of the
     * RubiksPiece objects constant (while the actual position and orientation
     * of each of the pieces change on rotations), the cube would be detected
     * as solved when each of the orientationMaps for each of the RubiksPiece
     * objects at each position matches those in the solvedStateOrientations
     * array.
     */
    generateSolvedState() {
        this.solvedStateOrientations = [
            [
                [{'W':'W','B':'B','R':'R'}, {'W':'W','B':'B'}, {'W':'W','B':'B','O':'O'}],
                [{'W':'W','R':'R'}, {'W':'W'}, {'W':'W','O':'O'}],
                [{'W':'W','G':'G','R':'R'}, {'W':'W','G':'G'}, {'W':'W','G':'G','O':'O'}]
            ], 
            [
                [{'B':'B', 'R':'R'}, {'B':'B'}, {'B':'B', 'O':'O'}],
                [{'R':'R'}, null, {'O':'O'}],
                [{'R':'R', 'G':'G'}, {'G':'G'}, {'O':'O', 'G':'G'}]
            ], 
            [
                [{'Y':'Y','R':'R','B':'B'}, {'Y':'Y','B':'B'}, {'Y':'Y','B':'B','O':'O'}],
                [{'Y':'Y','R':'R'}, {'Y':'Y'}, {'Y':'Y','O':'O'}],
                [{'Y':'Y','R':'R','G':'G'}, {'Y':'Y','G':'G'}, {'Y':'Y','G':'G','O':'O'}]
            ]
        ]

        // TODO: make each of the orientationMap objects separate instances.
        if (this.dimension > 3) {
            for (let i = 0; i < this.solvedStateOrientations.length; i++) {
                for (let j = 0; j < this.solvedStateOrientations[i].length; j++) {
                    for (let c = 1; c <= this.dimension - 3; c++) {
                        let orientationCopy = {}
                        Object.assign(orientationCopy, this.solvedStateOrientations[i][j][1])
                        this.solvedStateOrientations[i][j].insert(1, orientationCopy)
                    }
                }
                for (let c = 1; c <= this.dimension - 3; c++) {
                    //this.solvedStateOrientations[i].insert(1, this.solvedStateOrientations[i][1])
                    this.solvedStateOrientations[i].insert(1, JSON.parse(JSON.stringify(this.solvedStateOrientations[i][1])))
                }
            }
            for (let c = 1; c <= this.dimension - 3; c++)
                //this.solvedStateOrientations.insert(1, this.solvedStateOrientations[1])
                this.solvedStateOrientations.insert(1, JSON.parse(JSON.stringify(this.solvedStateOrientations[1])))
        } else if (this.dimension < 3) { // this.dimension == 2
            for (let i = 0; i < this.solvedStateOrientations.length; i++) {
                for (let j = 0; j < this.solvedStateOrientations[i].length; j++) {
                    this.solvedStateOrientations[i][j].splice(1, 1)
                }
                this.solvedStateOrientations[i].splice(1, 1)
            }
            this.solvedStateOrientations.splice(1, 1)
        }
    }

	/**
	 * Checks if the Rubik's cube is currently solved.
	 * @returns true for if the cube is currently solved, false for if the cube
	 * 			isn't
	 */
    isSolved() {
        for (let i = 0; i < this.coordinateMap.length; i++) {
            for (let j = 0; j < this.coordinateMap[0].length; j++) {
                for (let k = 0; k < this.coordinateMap[0][0].length; k++) {
                    let piece = this.coordinateMap[i][j][k]

                    if (piece != null) {
                        let hasCorrectPositions = piece.coordinates[0] == i &&
                                                  piece.coordinates[1] == j &&
                                                  piece.coordinates[2] == k
                        let hasCorrectOrientations = true

                        for (const [key, value] of Object.entries(piece.orientationMap)) {
                            hasCorrectOrientations &= (key == value)
                        }

                        if (!(hasCorrectPositions && hasCorrectOrientations)) {
                            return false
                        }
                    }
                }
            }
        }
        return true
    }

    updateCoordinateHashmap() {
        this.coordinateHashmap = {}
        for (const [key, value] of Object.entries(this.rotationGroups)) {
            for (let i = 0; i < value.length; i++) {
                this.coordinateHashmap[`${value[i].coordinates[0]}${value[i].coordinates[1]}${value[i].coordinates[2]}`] = value[i]
            }
        }

        //console.log(this.coordinateHashmap)
    }

    /**
     * Reset the Rubik's Cube's internal and external representation.
     */

    // TODO: update position setting for reset() to account for multiple different dimensions of cubes.
    reset() {
        for (let i = 0; i < this.coordinateMap.length; i++) {
            for (let j = 0; j < this.coordinateMap[0].length; j++) {
                for (let k = 0; k < this.coordinateMap[0][0].length; k++) {
                    let piece = this.coordinateMap[i][j][k]

                    if (piece != null) { // skipping the center piece
                        piece.coordinates = [i, j, k]

                        for (const [key, value] of Object.entries(piece.orientationMap)) {
                            piece.orientationMap[key] = key
                        }

                        piece.mesh.position.x = -0.02 + (k * 0.02)
                        piece.mesh.position.y = 0.02 - (i * 0.02)
                        piece.mesh.position.z = 0.02 - (j * 0.02)

                        piece.mesh.rotation.x = 0
                        piece.mesh.rotation.y = 0
                        piece.mesh.rotation.z = 0
                    }
                }
            }
        }
        this.resetMeshGroups()
        this.updateCoordinateHashmap()
        this.cubeMap.populateCubeMap()
    }

    /**
     * Empty each of the arrays of RubiksPiece meshes, such that they can be
     * rebuilt as part of resetting the cube.
     */
    resetMeshGroups() {
        for (const [key, value] of Object.entries(this.rotationGroups)) {
            this.rotationGroups[key] = []
        }
        this.buildMeshGroups()
    }
    
}

export default RubiksCube
