class UIControls {
	constructor(rubiksCube) {
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
		this.shuffleButton = document.getElementById("shuffle-btn")
		
		this.UI.style.display = 'none' // initially hide UI
		this.keybinds[1].style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
		this.keypressSpeed[0].style.backgroundColor = 'rgba(0, 0, 0, 0.15)'

		this.keybindsEnabled = false
		this.keypressMode = "Fast"

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
}

export default UIControls