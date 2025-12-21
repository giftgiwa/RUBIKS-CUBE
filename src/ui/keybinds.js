import RotationHelper from '../internal-rep/rubiks-rotation-helper'

/**
 * Class for creating keybinds for interacting with the Rubik's Cube.
 */
class Keybinds {
	/**
	 * Creates an instance of the Keybinds class.
	 * @param {UIControls} uicontrols instance of UIControls class to be
	 * 	associated with keybinds
	 * @param {RubiksCube} rubiksCube instance of RubiksCube class to be
	 *  associated with keybinds
	 */
    constructor(uiControls, rubiksCube) {
        this.uiControls = uiControls
        this.addInputs(rubiksCube)
    }

	/**
	 * Adds an event listener for detecting user inputed to rotate the cube
	 * if and only if keybinds are enabled.
	 *
	 * The R, O, Y, G, B, and W keys are used to rotate the red, orange, yellow,
	 * green, blue, and white faces, clockwise respectively. If the user had the 
	 * Shift key held down as they press each of these keys, then each of the
	 * faces rotate counterclockwise instead.
	 * 
	 * The rotateFace() function is called here with the swiping parameter set
	 * to false, and the current keypress mode determined by the instance of the
	 * UIControls class determines whether the face will rotate slowly or
	 * instantly.
	 */
    addInputs(rubiksCube) {
        let colors = new Set(["r", "o", "y", "g", "b", "w"])

        window.addEventListener("keypress", (event) => {
            if (this.uiControls.keybindsEnabled && !rubiksCube.isRotating) {
                if (colors.has(event.key.toLowerCase())) {
                    if (event.shiftKey) {
                        RotationHelper.rotateFace(
                            rubiksCube,
                            "ccw",
                            event.key.toUpperCase(),
                            false,
                            this.uiControls.keypressMode
                        )
                    }
                    else {
                        RotationHelper.rotateFace(
                            rubiksCube,
                            "cw",
                            event.key.toUpperCase(),
                            false,
                            this.uiControls.keypressMode
                        )
                    }
                }
            }
        })
    }

}

export default Keybinds
