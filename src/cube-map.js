import CubeMapTile from './cube-tile'

class CubeMap {
	colorHexes = {
		"W": "#FFFFFF",
		"R": "#E70005",
		"G": "#03E700",
		"O": "#E77100",
		"Y": "#E7CD00",
		"B": "#0068DD"
	}

	constructor(rubiksCube, isMobileDevice) {
		this.rubiksCube = rubiksCube
		this.rubiksCube.cubeMap = this
		this.isMobileDevice = isMobileDevice

		this.cubeMap = []
		for (let i = 0; i < 9; i++) {
			this.cubeMap.push(
				[null, null, null, null, null, null, null, null, null, null, null, null]
			)
		}
		this.createCubeMap()
		this.populateCubeMap()
		
	}

	show() {
		console.log("showing")
		this.outerDiv.style.display = "block"
	}

	hide() {
		console.log("hidden")
		this.outerDiv.style.display = "none"
	}

	createCubeMap() {
		// outer div
		this.outerDiv = document.createElement("div")
		this.outerDiv.style.width = "260px"
		this.outerDiv.style.height = "200px"
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

		let createMapFace = (offsetX, offsetY, faceColor) => {
			let faceTiles = [
				[null, null, null],
				[null, null, null],
				[null, null, null]
			]
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					let tile = document.createElement("div")
					applyTileStyle(tile)
					tile.style.top = `${10 + (offsetY * 20) + (20 * i)}px`
					tile.style.left = `${10 + (offsetX * 20) + (20 * j)}px`
					faceTiles[i][j] = tile
					this.outerDiv.appendChild(tile)
				}
			}

			if (faceColor == "G") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 0; j <= 2; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[2 - i, 2, j],
							faceColor
						)
						// color center piece green
						if (2 - i == 1 && j == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "W") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 0; j <= 2; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[0, 2 - i, j],
							faceColor
						)
						// color center piece white
						if (2 - i == 1 && j == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "R") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 2; j >= 0; j--) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[2 - j, 2 - i, 0],
							faceColor
						)
						// color center piece red
						if (2 - j == 1 && 2 - i == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "O") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 0; j <= 2; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[j, 2 - i, 2],
							faceColor
						)
						// color center piece orange
						if (j == 1 && 2 - i == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "Y") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 2; j >= 0; j--) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[2, 2 - i, 2 - j],
							faceColor
						)
						// color center piece red
						if (2 - i == 1 && 2 - j == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
					}
				}
			} else if (faceColor == "B") {
				for (let i = 0; i <= 2; i++) {
					for (let j = 0; j <= 2; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[i, 0, j],
							faceColor
						)
						// color center piece red
						if (i == 1 && j == 1)
							faceTiles[i][j].style.backgroundColor = this.colorHexes[faceColor]
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