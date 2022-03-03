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
				value: 0.1,
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
		if (time - this.stepTime > 30) {
			this.stepTime = time;
			this.program.uniforms.uTime.value = parseFloat(time * 0.001);
		}
	}
}
