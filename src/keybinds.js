import RotationHelper from './rubiks-rotation-helper'

class Keybinds {

    constructor(uiControls, rubiksCube) {
        this.uiControls = uiControls
        this.addInputs(rubiksCube)
    }

    addInputs(rubiksCube) {

        let colors = new Set(["r", "o", "y", "g", "b", "w"])
        window.addEventListener("keypress", (event) => {
            if (this.uiControls.keybindsEnabled) {
                if (colors.has(event.key.toLowerCase())) {
                    if (event.shiftKey) {
                        RotationHelper.rotateFace(rubiksCube, "ccw", event.key.toUpperCase())
                        console.log(rubiksCube.rotationGroups)
                    }
                    else {
                        RotationHelper.rotateFace(rubiksCube, "cw", event.key.toUpperCase())
                        console.log(rubiksCube.rotationGroups)
                    }
                }
            }
        })
    }

}

export default Keybinds