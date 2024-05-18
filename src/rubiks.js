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
     * @param {*} gltf actual gltf file imported into the THREE.js Scene
     */
    constructor(gltf) {
        this.gltf = gltf // store the model file
        this.edges = []
        this.faces = []
        this.corners = []

        this.initCoordinateMap() // build the coordinate map
    }

    // buildMeshGroups() {
    //     console.log(this.gltf)
    // }

    /**
     * "Parse" the Rubik's cube in its default state for 
     * its data structure representation.
     */
    initCoordinateMap() {

        // each of the nested-nested-nested-nested arrays store the colors of the piece
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

        console.log(this.coordinateMap)
        // console.log(this.coordinateMap[0][0][0])


        /**
         * NOTE: All of the pieces in the mesh are being iterated through
         *       (which excludes the "null center piece" in the middle layer).
         */
        for (let i = 0; i < this.gltf.children.length; i++) {

            let currentPiece = this.gltf.children[i]
            console.log(currentPiece)

            let x = Number(currentPiece.name[0])
            let y = Number(currentPiece.name[1])
            let z = Number(currentPiece.name[2])

            /**
             * RubiksPiece(colors, coordinates, orientationMap, mesh)
             */
            if (currentPiece.children.length == 2) { // face

                this.coordinateMap[x][y][z] = new RubiksPiece(
                    [],
                    [x, y, z],
                    {
                        
                    },
                    currentPiece
                )


                

            } else if (currentPiece.children.length == 3) { // edge
                // console.log("This is a edge piece.")

            } else if (currentPiece.children.length == 4) { // corner
                // console.log("This is a corner piece.")

            }
            
            // place the inidivual pieces inside of the coordinate map
            // this.coordinateMap[x][y][z] = [ne]

            

            // console.log(this.coordinateMap[x][y][z])


        }
    }
}

export default RubiksCube
