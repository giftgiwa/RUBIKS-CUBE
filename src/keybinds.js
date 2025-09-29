import RotationHelper from './rubiks-rotation-helper'

class Keybinds {
    constructor(uiControls, rubiksCube) {
        this.uiControls = uiControls
        //this.isRotating = false
        this.addInputs(rubiksCube)
    }

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