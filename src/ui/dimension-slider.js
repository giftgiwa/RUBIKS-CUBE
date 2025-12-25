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
		document.getElementById("user-interface").appendChild(this.button);

		let drag = false;
		let dimensionsRow = document.getElementById("dimensions-settings");
		let previousPosition = { x: 0, y: 0 };
		let tickCount = 0;

		this.button.addEventListener('mousedown', () => {
			drag = true;
		});

		let positionDimensionHashmap = {
			11: 2,
			90.6: 3,
			90: 3,
			169: 4,
			248: 5,
		};

		document.addEventListener('mousemove', (event) => {
			if (!(event.target.isEqualNode(dimensionsRow) || event.target.isEqualNode(this.button))) {
				tickCount = 0;
				drag = false;
				return;
			}
		})

		let currentPosition = 90.6;
		let idx = this.button.style.left.indexOf('p');
		dimensionsRow.addEventListener('mousemove', (event) => {
			currentPosition = parseInt(this.button.style.left.substring(0, idx));
			if (drag) {
				if (tickCount == -this.TICK_COUNT) {
					tickCount = 0;
					if (currentPosition > 11) {
						this.button.style.left = `${currentPosition - 79}px`;
						currentPosition = parseInt(this.button.style.left.substring(0, idx));
					}
					else {
						drag = false;
						tickCount = 0;
					}
				} else if (tickCount == this.TICK_COUNT) {
					tickCount = 0;
					if (currentPosition < 248) {
						this.button.style.left = `${currentPosition + 79}px`;
						currentPosition = parseInt(this.button.style.left.substring(0, idx));
					}
					else {
						drag = false;
						tickCount = 0;
					}
				}
				if (event.clientX - previousPosition.x > 0)
					tickCount++;
				else if (event.clientX - previousPosition.x < 0)
					tickCount--;

				previousPosition.x = event.clientX;
				previousPosition.y = event.clientY;
			}
		});
		document.addEventListener('mouseup', () => {
			drag = false;
			tickCount = 0;
			this.currentDimension = positionDimensionHashmap[currentPosition];

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
