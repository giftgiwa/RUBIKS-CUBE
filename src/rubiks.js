import * as THREE from 'three'
import { RubiksPiece } from './pieces'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'


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
     *      the white, red, and blue faces such that the yellow tile is on
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

    rotationGroups = {
        'W': [],
        'B': [],
        'O': [],
        'G': [],
        'R': [],
        'Y': [],
    }


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

        this.initCoordinateMap() // build the coordinate map
        this.buildMeshGroups() // build the mesh groups

        this.sampleRotate()
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
                    //    console.log(Object.values(this.coordinateMap[i][j][k]))

                        if (i == 0) { // white
                            this.rotationGroups["W"].push(this.coordinateMap[i][j][k])
                        }
                        if (i == 2) { // yellow
                            this.rotationGroups["Y"].push(this.coordinateMap[i][j][k])
                        }
                        if (j == 0) { // blue
                            this.rotationGroups["B"].push(this.coordinateMap[i][j][k])
                        }
                        if (j == 2) { // green
                            this.rotationGroups["G"].push(this.coordinateMap[i][j][k])
                        }
                        if (k == 0) { // red
                            this.rotationGroups["R"].push(this.coordinateMap[i][j][k])
                        }
                        if (k == 2) { // orange
                            this.rotationGroups["O"].push(this.coordinateMap[i][j][k])
                        }

                    }
                    
                }
                //break
            }
        }
      

        console.log(this.rotationGroups)
    }

    sampleRotate() {
        window.addEventListener("keypress", (event) => {
            if (event.key.toLowerCase() == "r") {
                for (let piece of this.rotationGroups["B"]) {
                    piece.mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2)
                }

                console.log(this.rotationGroups["B"])
                //console.log(this.counterclockwiseRotationMap["B"])

                for (let piece of this.rotationGroups["B"]) {
                    if (piece.colors.length == 3) { // handling corners
                        for (let i = 0; i < this.counterclockwiseRotationMap["B"].length; i++) {    
                            let sourceFace = this.counterclockwiseRotationMap["B"][i]

                            let destinationFace = null
                            if (i + 2 <= 3)
                                destinationFace = this.counterclockwiseRotationMap["B"][i + 2]
                            else
                                destinationFace = this.counterclockwiseRotationMap["B"][i - 2]

                            let adjacentFace = null
                            if (i + 1 <= 3)
                                adjacentFace = this.counterclockwiseRotationMap["B"][i + 1]
                            else
                                adjacentFace = this.counterclockwiseRotationMap["B"][0]
                            
                            if (this.rotationGroups[sourceFace].includes(piece) 
                                && this.rotationGroups[adjacentFace].includes(piece)) {
                                this.movePiece(piece, sourceFace, destinationFace)
                                break
                            }
                        }
                    } else if (piece.colors.length == 2) { // handling edges
                        for (let i = 0; i < this.counterclockwiseRotationMap["B"].length; i++) {
                            let sourceFace = this.counterclockwiseRotationMap["B"][i]

                            let destinationFace = null
                            if (i + 1 <= 3)
                                destinationFace = this.counterclockwiseRotationMap["B"][i + 1]
                            else
                                destinationFace = this.counterclockwiseRotationMap["B"][0]

                            if (this.rotationGroups[sourceFace].includes(piece)) {
                                this.movePiece(piece, sourceFace, destinationFace)
                                break
                            }
                        }
                        //break 

                    } else // handling center piece – do nothing
                        continue
                    

                }

                console.log(this.rotationGroups)




                

            }
        })
    }

    movePiece(piece, sourceFace, destinationFace) {
        // remove the piece that already exists
        for (let i = this.rotationGroups[sourceFace].length - 1; i > -1; i--) {
            let currentPiece = this.rotationGroups[sourceFace][i]
            if (currentPiece == piece) {
                this.rotationGroups[sourceFace].splice(i, 1)
                break
            }
        }
        this.rotationGroups[destinationFace].push(piece)

        //console.log(`Source Face: ${sourceFace}`)
        //console.log(this.rotationGroups[sourceFace])
        //console.log(`Destination Face: ${destinationFace}`) 
        //console.log(this.rotationGroups[destinationFace])
    }

    //moveEdge(piece, sourceFace, destinationFace) {
    //    for (let i = this.rotationGroups[sourceFace].length - 1; i > -1; i--) {
    //        let currentPiece = this.rotationGroups[sourceFace][i]
    //        if (currentPiece == piece) {
    //            this.rotationGroups[sourceFace].splice(i, 1)
    //            break
    //        }
    //    }
    //    this.rotationGroups[destinationFace].push(piece)
    //}
}

export default RubiksCube
