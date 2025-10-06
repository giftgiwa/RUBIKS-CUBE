class CubeMap {
	constructor(rubiksCube) {
		this.rubiksCube = rubiksCube
		//this.visible = false

		this.createCubeMap()
	}

	createCubeMap() {
		console.log("createCubeMap()")

		this.outerDiv = document.createElement("div")
		this.outerDiv.style.width = "min(400px, 100%)"
		this.outerDiv.style.height = "130px"
		this.outerDiv.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
		this.outerDiv.style.position = "absolute"
		this.outerDiv.style.right = "10px"
		this.outerDiv.style.bottom = "10px"
		this.outerDiv.style.backdropFilter = "blur(8px)"
		this.outerDiv.style.padding = "10px";

		let sampleTile = document.createElement("div")

		sampleTile.style.borderWidth = "2px"
		sampleTile.style.borderRadius = "2px"
		sampleTile.style.borderColor = "black"
		sampleTile.style.width = "20px"
		sampleTile.style.height = "20px"
		sampleTile.style.position = "relative"
		sampleTile.style.margin = "0"
		sampleTile.style.backgroundColor = "#fff"




		
		this.outerDiv.appendChild(sampleTile)

		document.body.appendChild(this.outerDiv)

	}


	show() {
		console.log("showing")
		this.outerDiv.style.display = "block"
	}

	hide() {
		console.log("hidden")
		this.outerDiv.style.display = "none"
	}
}

export default CubeMap