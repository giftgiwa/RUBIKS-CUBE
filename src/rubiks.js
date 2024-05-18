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
