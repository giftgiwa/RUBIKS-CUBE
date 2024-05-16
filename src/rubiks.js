import * as THREE from 'three'
import { RubiksPiece } from './pieces'


class RubiksCube {
    constructor(gltf) {
        this.gltf = gltf // store the model file
        this.edges = []
        this.faces = []
        this.corners = []

        this.buildCoordinateMap() // build the groups for the pieces
    }

    // buildMeshGroups() {
    //     console.log(this.gltf)
    // }

    /**
     * "Parse" the Rubik's cube in its default state for 
     * its data structure representation.
     */
    buildCoordinateMap() {

        // each of the nested-nested-nested-nested arrays store the colors of the piece
        this.coordinateMap = [
            [
                [[], [], []],
                [[], [], []],
                [[], [], []]
            ], 
            [
                [[], [], []],
                [[], [], []],
                [[], [], []]
            ], 
            [
                [[], [], []],
                [[], [], []],
                [[], [], []]
            ]
        ]

        this.flatCoordinateMap = [
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
        ]

        // console.log(this.coordinateMap)
        // console.log(this.coordinateMap[0][0][0])

        for (let i = 0; i < this.gltf.children.length; i++) {
            // console.log(Number(this.gltf.children[i].name[0]) + " " +
            //             Number(this.gltf.children[i].name[1]) + " " +
            //             Number(this.gltf.children[i].name[2]) + " "
            // )

            let currentPiece = this.gltf.children[i]

            let x = Number(currentPiece.name[0])
            let y = Number(currentPiece.name[1])
            let z = Number(currentPiece.name[2])

            // console.log(currentPiece)

            if (currentPiece.children.length == 2) { // face
                console.log("This is a face piece.")

                // let face = new Face()

            } else if (currentPiece.children.length == 3) { // edge
                console.log("This is a edge piece.")

            } else if (currentPiece.children.length == 4) { // corner
                console.log("This is a corner piece.")

            }

            this.coordinateMap[x][y][z] = []
        }
    }


}



export default RubiksCube