import * as THREE from 'three'
import { RubiksPiece } from './pieces'

class RubiksCube {
    /* Global Variables */

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
     * Lists the ordering of faces in the clockwise direction (for
     * handling rotations)
     */
    clockwiseRotationMap = {
        'W': ['B', 'R', 'G', 'O'],
        'B': ['W', 'O', 'Y', 'R'],
        'O': ['W', 'G', 'Y', 'B'],
        'G': ['W', 'R', 'Y', 'O'],
        'R': ['W', 'B', 'Y', 'G'],
        'Y': ['B', 'O', 'G', 'R']
    }

    counterclockwiseRotationMap = {
        'W': ['B', 'O', 'G', 'R'],
        'B': ['W', 'R', 'Y', 'O'],
        'O': ['W', 'B', 'Y', 'G'],
        'G': ['W', 'O', 'Y', 'R'],
        'R': ['W', 'G', 'Y', 'B'],
        'Y': ['B', 'R', 'G', 'O']
    }

    // initial state for Rubik's cube (used for initialization of coordinate map)
    /**
     * keys: color(s) of face/edge/corner
     * values: face that specific color(s) reside on
     * 
     * e.g. If a yellow/blue/red corner were to reside on the corner between
     *      the white, red, and blue faces 09-such that the yellow tile is on
     *      the white face, the red tile
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
     * Constructor for RubiksCube class.
     * @param {*} gltf actual GLTF file imported into the THREE.js Scene
     */
    constructor(gltf) {
        this.gltf = gltf // store the model file
        this.edges = []
        this.faces = []
        this.corners = []

        // store groups of the meshes (for handling rotation)
        this.meshGroups = {
            'W': [],
            'B': [],
            'O': [],
            'G': [],
            'R': [],
            'Y': [],
        }

        this.initCoordinateMap() // build the coordinate map\
        this.buildMeshGroups() // build the mesh groups
    }
    

    /**
     * "Parse" the Rubik's cube in its default state for 
     * its data structure representation.
     */
    initCoordinateMap() {
        // each of the nested-nested-nested-nested arrays will store the colors of the piece
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
        // console.log("Coordinate Map initialized.")
        
    }


    /**
     * Assign the Rubik's Cube pieces into groups for face rotations.
     */
    buildMeshGroups() {
        console.log(this.coordinateMap)

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

        this.sampleGroup = new THREE.Group();

        for (let i = 0; i < this.coordinateMap.length; i++) {
            for (let j = 0; j < this.coordinateMap[0].length; j++) {
                for (let k = 0; k < this.coordinateMap[0][0].length; k++) {
                    console.log(this.coordinateMap[i][j][k])

                    this.sampleGroup.add(this.coordinateMap[i][j][k].mesh)
                    // skipping the null middle piece
                    //if (this.coordinateMap[i][j][k]) {
                    //    console.log(Object.values(this.coordinateMap[i][j][k]))

                        //for (let face in Object.values(this.coordinateMap[i][j][k].orientationMap)) {
                        //    console.log(face)
                        //}

                    //this.meshGroups['B'].push(this.coordinateMap[i][j][k])

                    //}
                    
                }
                break
            }
        }

        

        //console.log(this.meshGroups)


    }
}

export default RubiksCube
