import RotationHelper from './rotation_helper'

class KeybindHelper {

    static addInputs(rubiksCube) {
        console.log("addInputs()")

        // window.addEventListener("keypress", (event) => {
    //         if (event.key.toLowerCase() == "r") {
    //             // this.rotateFace("cw", "B")
    //             RotationHelper.rotateFace(this, "cw", "B")
    //         }
    //     })

    //     window.addEventListener("keypress", (event) => {
    //         if (event.key.toLowerCase() == "d") {
    //             // this.rotateFace("ccw", "W")
    //             RotationHelper.rotateFace(this, "ccw", "W")
    //         }
    //     })
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

export default KeybindHelper