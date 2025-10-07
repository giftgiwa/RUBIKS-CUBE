import CubeMapTile from './cube-tile'

class CubeMap {
	constructor(rubiksCube) {
		this.rubiksCube = rubiksCube
		this.cubeMap = []
		for (let i = 0; i < 9; i++) {
			this.cubeMap.push(
				[null, null, null, null, null, null, null, null, null, null, null, null]
			)
		}
		this.createCubeMap()
		console.log(this.cubeMap)
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
		this.outerDiv.style.width = "280px"
		this.outerDiv.style.height = "200px"
		this.outerDiv.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
		this.outerDiv.style.position = "absolute"
		this.outerDiv.style.right = "10px"
		this.outerDiv.style.bottom = "10px"
		this.outerDiv.style.backdropFilter = "blur(8px)"
		this.outerDiv.style.padding = "10px";
		this.outerDiv.style.boxSizing = "border-box"

		let applyTileStyle = (tile) => {
			tile.style.borderWidth = "2px"
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
							[2 - i, 2, j]
						)

						// color center piece green
						if (2 - i == 1 && j == 1)
							faceTiles[i][j].style.backgroundColor = "#03E700"
					}
				}
			} else if (faceColor == "W") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 0; j <= 2; j++) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[0, 2 - i, j]
						)

						// color center piece white
						if (2 - i == 1 && j == 1)
							faceTiles[i][j].style.backgroundColor = "#FFFFFF"
					}
				}
			} else if (faceColor == "R") {
				for (let i = 2; i >= 0; i--) {
					for (let j = 2; j >= 0; j--) {
						this.cubeMap[i + offsetY][j + offsetX] = new CubeMapTile(
							faceTiles[i][j],
							[2 - j, 2 - i, 0]// [0, 2 - i, j]
						)

						// color center piece red
						if (2 - j == 1 && 2 - i == 1)
							faceTiles[i][j].style.backgroundColor = "#E70005"
					}
				}
			} else if (faceColor == "O") {
				// TODO
			} else if (faceColor == "Y") {
				// TODO
			} else if (faceColor == "B") {
				// TODO
			}
		}
		
		createMapFace(3, 0, "G") // green face
		createMapFace(3, 3, "W") // white face
		createMapFace(0, 3, "R") // red face


		document.body.appendChild(this.outerDiv)
	}
}

export default CubeMap