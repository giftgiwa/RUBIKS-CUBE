class RubiksPiece {
    constructor(colors, coordinates, orientationMap, mesh) {
        this.colors = colors
        this.coordinates = coordinates // coordinates dictates position
        this.orientationMap = orientationMap // the orientationMap dictates orientation
        this.mesh = mesh // mesh of individual piece on actual cube
    }
}


export { RubiksPiece }
