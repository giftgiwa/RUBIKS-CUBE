import * as THREE from "three";
import RubiksCube from "../rubiks-cube";

/**
 * 
 */
class DimensionSlider {

	/**
	 * 
	 * @param {RubiksCube} rubiksCubes Array of Rubik's cubes
	 */
	constructor(rubiksCubes, scene) {
		this.rubiksCubes = rubiksCubes;
		this.scene = scene;
		this.createSliderButton();

		this.currentDimension = 3;
		this.rubiksCubes[this.currentDimension - 2].isRendered = true;
		this.renderCube();
	}

	createSliderButton() {
		this.TICK_COUNT = 5;
		this.button = document.createElement("button");
		this.button.id = "slider";
		this.button.style.position = "absolute";
		this.button.style.left = `${90.6}px`;
		this.button.style.top = `${98.88+10+24}px`;
		this.button.style.width = "50px";
		this.button.style.transition = "0.0s";
		this.button.style.height = "50px";
		this.button.style.borderWidth = "0px";
		this.button.style.margin = "0px !important";
		this.button.style.paddingBlock = "0px !important";
		this.button.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
		this.button.classList.add("btn");

		this.sliderBounds = [11.6, 248];
		document.getElementById("dimensions-settings").appendChild(this.button);

		let drag = false;
		let dimensionsRow = document.getElementById("dimensions-settings");

		this.button.addEventListener('mousedown', () => {
			drag = true;
		});

		let positionDimensionHashmap = {
			11: 2,
			90: 3,
			169: 4,
			248: 5,
		};

		let buttonPositions = [11.6, 90.6, 169.6, 248.6];
		let currentPosition = 90.6;
		let offset = document.querySelector('#dimensions-settings').getBoundingClientRect();
		let dimensionsXBounds = [[25, 65], [100, 140], [185, 225], [260, 300]];
		let dimensionsYBounds = [215, 260];

		document.addEventListener('mousemove', (event) => {
			if (!(event.target.isEqualNode(dimensionsRow) || event.target.isEqualNode(this.button))) {
				drag = false;
				return;
			}
		});

		dimensionsRow.addEventListener('mousemove', (event) => {
			/**
			 * Source: https://stackoverflow.com/a/14651424
			 */
			let posX = event.pageX - offset.left, posY = event.pageY - offset.top;
			if (drag) {
				for (let i = 0; i < dimensionsXBounds.length; i++) {
					if (
						dimensionsXBounds[i][0] <= posX &&
						posX <= dimensionsXBounds[i][1] &&
						dimensionsYBounds[0] <= posY &&
						posY <= dimensionsYBounds[1]
					) {
						currentPosition = buttonPositions[i]
						this.button.style.left = `${buttonPositions[i]}px`;
						break
					}
				}
			}
		});
		document.addEventListener('mouseup', () => {
			drag = false;
			this.currentDimension = positionDimensionHashmap[Math.floor(currentPosition)];
			this.renderCube();
		});
	}

	renderCube() {
		for (let i = 0; i < this.rubiksCubes.length; i++) {
			if (i != this.currentDimension - 2) {
				this.rubiksCubes[i].isRendered = false;
				this.rubiksCubes[i].mesh.visible = false;
				this.rubiksCubes[i].collisionCube.cube.visible = false;

				if (this.rubiksCubes[i].cubeMap) {
					this.rubiksCubes[i].cubeMap.hide();
				}
			} else {
				this.rubiksCubes[i].isRendered = true;
				this.rubiksCubes[i].mesh.visible = true;
				this.rubiksCubes[i].mesh.updateMatrixWorld();
				this.rubiksCubes[i].collisionCube.cube.visible = true;

				if (this.rubiksCubes[i].cubeMap) {
					this.rubiksCubes[i].cubeMap.show();
				}
			}
		}
	}
}

export default DimensionSlider;
