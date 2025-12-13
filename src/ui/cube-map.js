import CubeMapTile from './cube-tile'

/**
 * Class for representing the 2D representation of a Rubik's Cube (similarly to
 * opening a box into a flat, cross-shaped layout)
 */
class CubeMap {
	/**
	 * Hexes of each of the colors on the Rubik's Cube (made to match the hexes
	 * in the imported gltf model).
	 */
	colorHexes = {
		"W": "#FFFFFF",
		"R": "#E70005",
		"G": "#03E700",
		"O": "#E77100",
		"Y": "#E7CD00",
		"B": "#0068DD"
	}

	/**
	 * Creates an instance of the CubeMap class.
	 * @param {RubiksCube} rubiksCube instance of RubiksCube object
	 * @param {Boolean} isMobileDevice whether the user is currently on a mobile
	 * device or not. The CubeMap is currently set not to appear on mobile
	 * devices.
	 */
	constructor(rubiksCube, isMobileDevice) {
		this.rubiksCube = rubiksCube
		this.rubiksCube.cubeMap = this
		this.isMobileDevice = isMobileDevice

		this.cubeMap = []
		for (let i = 0; i < this.rubiksCube.dimension ** 2; i++) {
			this.cubeMap.push(
				[null, null, null, null, null, null, null, null, null, null, null, null]
			)
		}
		this.createCubeMap()
		this.populateCubeMap()
		
	}

	/**
	 * Display the cube map on the screen.
	 */
	show() {
		this.outerDiv.style.display = "block"
	}

	/**
	 * Hides the cube map from the screen.
	 */
	hide() {
		this.outerDiv.style.display = "none"
	}

	/**
	 * Creates cube map as a set of squares with rounded corners that form a
	 * horizontal, cross-shaped configuration, similarly to a cube in 2D form.
	 */
	createCubeMap() {
		// outer div
		this.outerDiv = document.createElement("div")
		this.outerDiv.style.width = `${this.rubiksCube.dimension * 4 * 20 + 20}px`
		this.outerDiv.style.height = `${this.rubiksCube.dimension * 3 * 20 + 20}px`
		this.outerDiv.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
		this.outerDiv.style.position = "absolute"
		this.outerDiv.style.right = "10px"
		this.outerDiv.style.bottom = "10px"
		this.outerDiv.style.backdropFilter = "blur(8px)"
		this.outerDiv.style.padding = "10px";
		this.outerDiv.style.boxSizing = "border-box"
		if (this.isMobileDevice) {
			this.outerDiv.style.display = "none"
		}

		let applyTileStyle = (tile) => {
			tile.style.borderWidth = "1.5px"
			tile.style.borderRadius = "2px"
			tile.style.borderColor = "black"
			tile.style.boxSizing = "border-box"
			tile.style.borderStyle = "solid"
			tile.style.position = "absolute"
			tile.style.display = "flex"
			tile.style.margin = "0"
			tile.style.backgroundColor = "#fff"
			tile.style.width = "20px"
			tile.style.height = "20px"
		}

		/**
		 * Places the squares that make up the cube map.
		 *
		 * Each set of 9 squares gets created by referencing 
		 * entries in the cubeMap member variable in either row-major
		 * or column major order in some combination of up-to-down,
		 * left-to-right, down-to-up, or right-to-left based on the
		 * orientation of the face in the open-box configuration of
		 * the map.
		 *
		 */
		let createMapFace = (offsetX, offsetY, faceColor) => {
			let faceTiles = [
				[null, null, null],
				[null, null, null],
				[null, null, null]
			]
			for (let i = 0; i < this.rubiksCube.dimension; i++) {
				for (let j = 0; j < this.rubiksCube.dimension; j++) {
					let tile = document.createElement("div")
					applyTileStyle(tile)
					tile.style.top = `${10 + (offsetY * 20) + (20 * i)}px`
					tile.style.left = `${10 + (offsetX * 20) + (20 * j)}px`
					faceTiles[i][j] = tile
					this.outerDiv.appendChild(tile)
				}
			}

			let dimension = this.rubiksCube.dimension
			if (faceColor == "G") {
				for (let i = dimension - 1; i >= 0; i--) {
					for (let j = 0; j <= dimension - 1; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[dimension - 1 - i, dimension - 1, j],
							faceColor
						)
						// color center piece green
						//if (dimension - 1 - i == 1 && j == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "W") {
				for (let i = dimension - 1; i >= 0; i--) {
					for (let j = 0; j <= dimension - 1; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[0, dimension - 1 - i, j],
							faceColor
						)
						// color center piece white
						//if (dimension-1-i == 1 && j == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "R") {
				for (let i = dimension - 1; i >= 0; i--) {
					for (let j = dimension - 1; j >= 0; j--) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[dimension - 1 - j, dimension - 1 - i, 0],
							faceColor
						)
						// color center piece red
						//if (dimension - 1 - j == 1 && dimension - 1 - i == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "O") {
				for (let i = dimension-1; i >= 0; i--) {
					for (let j = 0; j <= dimension-1; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[j, dimension-1-i, dimension - 1],
							faceColor
						)
						// color center piece orange
						//if (j == 1 && dimension-1-i == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "Y") {
				for (let i = dimension-1; i >= 0; i--) {
					for (let j = dimension-1; j >= 0; j--) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[dimension-1, dimension-1 - i, dimension-1 - j],
							faceColor
						)
						// color center piece red
						//if (dimension-1 - i == 1 && dimension-1 - j == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "B") {
				for (let i = 0; i <= dimension-1; i++) {
					for (let j = 0; j <= dimension-1; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[i, 0, j],
							faceColor
						)
						// color center piece red
						//if (i == 1 && j == 1)
						//	faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			}
		}
		
		createMapFace(3, 0, "G") // green face
		createMapFace(3, 3, "W") // white face
		createMapFace(0, 3, "R") // red face
		createMapFace(6, 3, "O") // orange face
		createMapFace(3, 6, "B") // blue face
		createMapFace(9, 3, "Y") // yellow face

		document.body.appendChild(this.outerDiv)
	}

	populateCubeMap() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 12; j++) {
				if (this.cubeMap[i][j] !== null) {
					let coordinateString = `${this.cubeMap[i][j].coordinates[0]}${this.cubeMap[i][j].coordinates[1]}${this.cubeMap[i][j].coordinates[2]}`
					let faceColor = this.cubeMap[i][j].faceColor
					let tileElement = this.cubeMap[i][j].tileElement
					let orientationMap = this.rubiksCube.coordinateHashmap[coordinateString].orientationMap
					let reverseOrientationMap = Object.fromEntries(Object.entries(orientationMap).map(([key, value]) => [value, key]))

					tileElement.style.backgroundColor = this.colorHexes[reverseOrientationMap[faceColor]]
				}
			}
		}
	}
}

export default CubeMap
