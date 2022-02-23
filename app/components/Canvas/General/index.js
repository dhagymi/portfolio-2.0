import { Plane, Transform } from "ogl";

import Noise from "./Noise.js";

export default class {
	constructor({ gl, scene, sizes }) {
		this.gl = gl;
		this.scene = scene;
		this.sizes = sizes;

		this.group = new Transform();

		this.createGeometry();
		this.createNoise();
	}

	createGeometry() {
		this.geometry = new Plane(this.gl, {
			heightSegments: 20,
			widthSegments: 20,
		});
	}

	createNoise() {
		this.noise = new Noise({
			geometry: this.geometry,
			gl: this.gl,
			scene: this.group,
			sizes: this.sizes,
		});
	}

	/**
	 * Animations.
	 */
	show(isPreloaded) {
		this.group.setParent(this.scene);

		this.noise.show(isPreloaded);
	}

	/* Events */

	onResize(values) {
		this.sizes = values.sizes;

		this.noiseSizes = {
			height: this.sizes.height,
			width: this.sizes.width,
		};

		this.noise.onResize(values);
	}

	/* Loop */
	update(time) {
		this.noise.update(time);
	}
}
