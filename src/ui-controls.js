import CubeMap from './cube-map'

class UIControls {
	constructor(rubiksCube, isMobileDevice) {
		this.rubiksCube = rubiksCube
		this.UI = document.getElementById("user-interface")
		this.menuIcon = document.getElementById("menu-icon")
		this.keybinds = [
			document.getElementById("keybinds-on"),
			document.getElementById("keybinds-off")
		]
		//this.mode = [
		//	document.getElementById("button-mode"),
		//	document.getElementById("swipe-mode"),
		//	document.getElementById("mix-mode")
		//]
		this.keypressSpeed = [
			document.getElementById("keypress-fast"),
			document.getElementById("keypress-slow")
		]
		//this.quickDrag = [
		//	document.getElementById("quick-drag-on"),
		//	document.getElementById("quick-drag-off")]
		this.showCubeMap = [
			document.getElementById("show-cubemap"),
			document.getElementById("hide-cubemap")
		]
		this.shuffleButton = document.getElementById("shuffle-btn")
		this.resetButton = document.getElementById("reset-btn")
		
		this.UI.style.display = 'none' // initially hide UI

		if (isMobileDevice)
			document.getElementById("cube-map-settings").style.display = "none"

		this.keybinds[1].style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
		this.keypressSpeed[0].style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
		this.showCubeMap[0].style.backgroundColor = 'rgba(0, 0, 0, 0.15)'

		this.keybindsEnabled = false
		this.keypressMode = "Fast"
		this.cubeMapMode = "On"

		this.cubeMap = new CubeMap(rubiksCube, isMobileDevice)
		this.isMobileDevice = window.mobileCheck()

		/**
		 * Hide and show settings as user clicks on the menu icon in the
		 * top-right corner.
		 */
		this.menuIcon.addEventListener("click", (event) => {
			if (this.UI.style.display == 'none') {
				this.UI.style.display = 'block'
				this.menuIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
			} else {
				this.UI.style.display = 'none'
				this.menuIcon.style.backgroundColor = 'rgba(0, 0, 0, 0)'
			}
		})

		this.setupKeybinds()
		this.setupKeypressSpeed()
		this.setupCubeMap()
		this.setupShuffle()
		this.setupReset()
	}

	setupKeybinds() {
		this.keybinds.forEach((button) => {
			button.addEventListener("click", (event) => {
				if (event.target.textContent == "On") {
					this.keybindsEnabled = true
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.keybinds[1].style.backgroundColor = 'rgba(0, 0, 0, 0)'
				} else { // event.target.textContent == "Off"
					this.keybindsEnabled = false
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.keybinds[0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
				}
			})
		})
	}

	setupKeypressSpeed() {
		this.keypressSpeed.forEach((button) => {
			button.addEventListener("click", (event) => {
				if (event.target.textContent == "Fast") {
					this.keypressMode = "Fast"
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.keypressSpeed[1].style.backgroundColor = 'rgba(0, 0, 0, 0)'
				} else { // event.target.textContent == "Slow"
					this.keypressMode = "Slow"
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.keypressSpeed[0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
				}
			})
		})
	}

	setupCubeMap() {
		this.showCubeMap.forEach((button) => {
			button.addEventListener("click", (event) => {
				if (event.target.textContent == "On") {
					this.cubeMapMode = "On"
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.showCubeMap[1].style.backgroundColor = 'rgba(0, 0, 0, 0)'
					this.cubeMap.show()
				} else { // event.target.textContent == "Off"
					this.cubeMapMode = "Off"
					event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
					this.showCubeMap[0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
					this.cubeMap.hide()
				}
			})
		})
	}

	setupShuffle() {
		/**
		 * On click, the Rubik's cube shuffles on screen, either quickly or
		 * slowly.
		 * 
		 * Admittedly, an unconventional choice I made here were having the
		 * shuffle() function called on the RubiksCube object AND having a
		 * reference to the RubiksCube object passed in as a parameter. The
		 * reason for this was that the shuffle() function references member
		 * variables for the cube itslef, but the RotationHelper.rotateFace()
		 * function call references the passed-in parameter since it used a
		 * different context and would fail if rotateFace(this, ...) were used
		 * instead.
		 */
		this.shuffleButton.addEventListener("click", (event) => {
			this.shuffleButton.disabled = true
			this.shuffleButton.style.borderColor = "#b3b3b3"
			this.shuffleButton.style.color = "#b3b3b3"
			this.shuffleButton.style.cursor = "not-allowed"
			
			this.rubiksCube.shuffle(this.rubiksCube, this.keypressMode, this.shuffleButton)
		})
	}

	setupReset() {
		/**
		 * On click, the Rubik's Cube resets to its original, solved state
		 */
		this.resetButton.addEventListener("click", (event) => {
			this.rubiksCube.reset()
		})
	}

	static congratulations() {
		let congrats = document.createElement('p')
		congrats.style.textAlign = "left"
		congrats.style.position = "absolute"
		congrats.style.fontSize = "13px"
		congrats.style.bottom = "10px"
		congrats.style.left = "10px"
		congrats.style.color = "#3e8a40ff"
		congrats.innerHTML = `Congratulations!!!`

		document.body.appendChild(congrats)
		setTimeout(() => {
			document.body.removeChild(congrats)
		}, 1000)
	}
}

export default UIControls