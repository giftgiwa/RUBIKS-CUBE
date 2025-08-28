import RotationHelper from './RotationHelper'

class Keybinds {

    static addInputs(rubiksCube) {

        let colors = new Set(["r", "o", "y", "g", "b", "w"])
        window.addEventListener("keypress", (event) => {
            if (colors.has(event.key.toLowerCase())) {
                if (event.shiftKey)
                    RotationHelper.rotateFace(rubiksCube, "ccw", event.key.toUpperCase())
                else
                    RotationHelper.rotateFace(rubiksCube, "cw", event.key.toUpperCase())
            }
        })
    }

}

export default Keybinds