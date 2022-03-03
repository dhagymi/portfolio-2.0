import { Mesh, Program } from "ogl";
import GSAP from "gsap";

import fragment from "shaders/general-fragment.glsl";
import vertex from "shaders/general-vertex.glsl";

export default class {
	constructor({ geometry, gl, scene, sizes }) {
		this.gl = gl;
		this.scene = scene;
		this.sizes = sizes;
		this.geometry = geometry;

		this.createProgram();
		this.createMesh();
		this.createBounds({
			sizes: this.sizes,
		});

		this.stepTime = 0;

		const container = document.createElement("div");
		container.style.position = "absolute";
		container.style.left = "0";
		container.style.top = "0";
		container.style.zIndex = "11";
		container.style.color = "white";
		container.innerHTML = `
			<input id="alpha" type="range" min="0" max="0.2" step="0.02" list="tickmarks">
			<datalist id="tickmarks">
				<option value="0" label="0">
				<option value="0.02">
				<option value="0.04">
				<option value="0.06">
				<option value="0.08">
				<option value="0.1" label="0.1%">
				<option value="0.12">
				<option value="0.14">
				<option value="0.16">
				<option value="0.18">
				<option value="0.2" label="0.2">
			</datalist>
		`;
		document.body.appendChild(container);
	}

	createProgram() {
		this.program = new Program(this.gl, {
			fragment,
			vertex,
			uniforms: {
				uAlpha: { value: 0 },
				uTime: { value: 0 },
			},
		});
	}

	createMesh() {
		this.mesh = new Mesh(this.gl, {
			geometry: this.geometry,
			program: this.program,
		});

		this.mesh.setParent(this.scene);
	}

	createBounds({ sizes }) {
		this.sizes = sizes;
		this.bounds = {
			height: window.innerHeight,
			width: window.innerWidth,
		};

		this.updateScale();
	}

	show() {
		this.timelineIn = GSAP.timeline({
			delay: GSAP.utils.random(0.5, 1),
		});

		this.timelineIn.to(
			this.program.uniforms.uAlpha,
			{
				duration: 2,
				ease: "expo.inOut",
				value: 0.08,
			},
			"start"
		);
	}

	/**
	 * Events.
	 */
	onResize(sizes) {
		this.createBounds(sizes);
	}

	/**
	 * Loop.
	 */
	updateScale() {
		this.height = this.bounds.height / window.innerHeight;
		this.width = this.bounds.width / window.innerWidth;

		this.mesh.scale.x = this.sizes.width * this.width;
		this.mesh.scale.y = this.sizes.height * this.height;
	}

	update(time) {
		if (time - this.stepTime > 10) {
			this.stepTime = time;
			this.program.uniforms.uTime.value = parseFloat(time * 0.001);
			this.program.uniforms.uAlpha.value = parseFloat(
				document.querySelector("#alpha").value
			);
		}
	}
}
