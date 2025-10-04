import * as THREE from 'three'
import RubiksPiece from './rubiks-piece'
import RotationHelper from './rubiks-rotation-helper'

class RubiksCube {
    /* Member Variables */

    /**
     * lists complementary faces on rubiks cube (i.e. faces that exist on
     * opposite sides of the cube, such as the blue and green face).
     */
    complements = {
        'W': 'Y', 'Y': 'W',
        'O': 'R', 'R': 'O',
        'B': 'G', 'G': 'B'
    }

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
        'Y': ['B', 'O', 'G', 'R']
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
        'Y': ['B', 'R', 'G', 'O']
    }

    /**
     *Initial state for Rubik's cube (used for initialization of coordinate map)
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
    solvedStateOrientations = [
        [
            //   (0, 0, 0) , (0, 0, 1) , (0, 0, 2)
            [{'W':'W','B':'B','R':'R'}, {'W':'W','B':'B'}, {'W':'W','B':'B','O':'O'}],
            //   (0, 1, 0) , (0, 1, 1) , (0, 1, 2)
            [{'W':'W','R':'R'}, {'W':'W'}, {'W':'W','O':'O'}],
            //   (0, 1, 0) , (0, 1, 1) , (0, 1, 2)
            [{'W':'W','G':'G','R':'R'}, {'W':'W','G':'G'}, {'W':'W','G':'G','O':'O'}]
        ], 
        [
            //   (1, 0, 0) , (1, 0, 1) , (1, 0, 2)
            [{'B':'B', 'R':'R'}, {'B':'B'}, {'B':'B', 'O':'O'}],
            //   (1, 1, 0) , (1, 1, 1) , (1, 1, 2)
            [{'R':'R'}, null, {'O':'O'}],
            //   (1, 1, 0) , (1, 1, 1) , (1, 1, 2)
            [{'R':'R', 'G':'G'}, {'G':'G'}, {'O':'O', 'G':'G'}]
        ], 
        [
            //   (2, 0, 0) , (2, 0, 1) , (2, 0, 2)
            [{'Y':'Y','R':'R','B':'B'}, {'Y':'Y','B':'B'}, {'Y':'Y','B':'B','O':'O'}],
            //   (2, 1, 0) , (2, 1, 1) , (2, 1, 2)
            [{'Y':'Y','R':'R'}, {'Y':'Y'}, {'Y':'Y','O':'O'}],
            //   (2, 1, 0) , (2, 1, 1) , (2, 1, 2)
            [{'Y':'Y','R':'R','G':'G'}, {'Y':'Y','G':'G'}, {'Y':'Y','G':'G','O':'O'}]
        ]
    ]

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
        'G': new THREE.Vector3(0, 0, -1), /* z */
        'R': new THREE.Vector3(-1, 0, 0), /* x */
        'Y': new THREE.Vector3(0, -1, 0), /* y */
    }

    moves = [
        "W|cw", "W|ccw", "B|cw", "B|ccw", "O|cw", "O|ccw",
        "G|cw", "G|ccw", "R|cw", "R|ccw", "Y|cw", "Y|ccw"
    ]

    /**
     * Constructor for RubiksCube class. The rotationGroups hash map and
     * coordinateMap array get
     * @param {*} gltf actual GLTF file imported into the THREE.js Scene
     */
    constructor(gltf) {
        this.gltf = gltf // store the model file
        this.initCoordinateMap() // build the coordinate map
        this.buildMeshGroups() // build the mesh groups

        /**
         * 
         */
        this.isRotating = false

        /**
         * 
         */
        this.isShuffling = false
    }

    /**
     * "Parse" the Rubik's cube in its default state for 
     * its data structure representation.
     */
    initCoordinateMap() {
        // each of the triple-nested arrays will store the colors of the piece
        this.coordinateMap = [
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ], 
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ], 
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ]
        ]

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
            let colors = Object.keys(this.solvedStateOrientations[x][y][z])
            let currentOrientationMap = this.solvedStateOrientations[x][y][z]

            this.coordinateMap[x][y][z] = new RubiksPiece(
                colors, /* colors */
                [x, y, z], /* coordinates */
                currentOrientationMap, /* orientaton map */
                currentPiece /* mesh (within GLTF file) */
            )
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
                    // skipping the null middle piece
                    if (this.coordinateMap[i][j][k]) {
                        if (i == 0) this.rotationGroups["W"].push(this.coordinateMap[i][j][k]) // white
                        if (i == 2) this.rotationGroups["Y"].push(this.coordinateMap[i][j][k]) // yellow
                        if (j == 0) this.rotationGroups["B"].push(this.coordinateMap[i][j][k]) // blue
                        if (j == 2) this.rotationGroups["G"].push(this.coordinateMap[i][j][k]) // green
                        if (k == 0) this.rotationGroups["R"].push(this.coordinateMap[i][j][k]) // red
                        if (k == 2) this.rotationGroups["O"].push(this.coordinateMap[i][j][k]) // orange
                    }             
                }
            }
        }

    }

    shuffle(rubiksCube, keypressMode, shuffleButton) {
        this.isShuffling = true
        let previousMove = null

        let moves = []

        let numMoves = 0
        while (numMoves < 40) {
            let currentMove = this.moves[Math.floor(Math.random() * this.moves.length)];
            if (previousMove != currentMove) {
                let color = currentMove.substring(0, 1)
                let direction = currentMove.substring(2)

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
                    return
                }

                animateMove()
            }, keypressMode == "Fast" ? 100 : 350)
        }
        animateMove()


    }
}

export default RubiksCube
