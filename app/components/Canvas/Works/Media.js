import GSAP from "gsap";
import { Mesh, Program } from "ogl";

import { lerp } from "utils/math.js";

import fragment from "shaders/works-fragment.glsl";
import vertex from "shaders/works-vertex.glsl";

export default class {
	constructor({ element, geometry, gl, index, scene, sizes, aspectRatio }) {
		this.element = element;
		this.geometry = geometry;
		this.gl = gl;
		this.index = index;
		this.scene = scene;
		this.sizes = sizes;
		this.aspectRatio = aspectRatio;

		this.timeZero = true;

		this.extra = {
			x: 0,
			y: 0,
		};

		this.magnification = {
			current: 0.05,
			target: 0.05,
			lerp: 0.05,
			ease: 0.1,
			isLearping: false,
		};

		this.onMouseOutEvent = this.onMouseOut.bind(this);
		this.onMouseOverEvent = this.onMouseOver.bind(this);

		this.createTexture();
		this.createProgram();
		this.createMesh();
		this.createBounds({
			sizes: this.sizes,
		});
		this.addEventListeners();
	}

	createTexture() {
		const image = this.element;

		this.texture = window.TEXTURES[image.getAttribute("data-src")];
	}

	createProgram() {
		this.program = new Program(this.gl, {
			fragment,
			vertex,
			uniforms: {
				uAlpha: { value: 0 },
				uWidth: { value: 0.1 },
				uMagnification: { value: 0.05 },
				uTime: { value: 0 },
				uInfiniteTime: { value: 0 },
				uFirstWave: { value: false },
				uHover: { value: false },
				uSpeed: { value: 10.0 },
				uViewportSizes: { value: [this.sizes.width, this.sizes.height] },
				uCardSizes: {
					value: [
						this.element.getBoundingClientRect().width,
						this.element.getBoundingClientRect().height,
					],
				},
				uScrollSpeed: { value: 0 },
				uResolution: {
					value: [window.innerWidth, window.innerHeight],
				},
				tMap: { value: this.texture },
				uAspectRatio: { value: this.aspectRatio },
			},
		});
	}

	createMesh() {
		this.mesh = new Mesh(this.gl, {
			geometry: this.geometry,
			program: this.program,
		});

		this.mesh.setParent(this.scene);
		// this.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03)
	}

	createBounds({ sizes }) {
		this.sizes = sizes;

		this.bounds = this.element.parentNode.parentNode.getBoundingClientRect();

		this.updateScale();
		this.updateX();
		this.updateY();
	}

	/**
	 * Animations.
	 */
	show(isPreloaded) {
		this.timelineIn = GSAP.timeline({
			delay: GSAP.utils.random(0, 0.3),
		});

		this.timelineIn.fromTo(
			this.program.uniforms.uAlpha,
			{
				value: 0,
			},
			{
				duration: 2,
				ease: "expo.inOut",
				value: 1,
			},
			"start"
		);

		this.timelineIn.fromTo(
			this.mesh.position,
			{
				z: GSAP.utils.random(2, 6),
			},
			{
				duration: 2,
				ease: "expo.inOut",
				z: 0,
			},
			"start"
		);
	}

	hide() {
		this.timelineIn = GSAP.timeline();

		this.timelineIn.fromTo(
			this.program.uniforms.uAlpha,
			{
				value: 1,
			},
			{
				value: 0,
			},
			"start"
		);
	}

	/**
	 * Events.
	 */
	onResize(sizes, scroll) {
		this.extra = {
			x: 0,
			y: 0,
		};

		this.createBounds(sizes);
		this.updateX(scroll && scroll.x);
		this.updateY(scroll && scroll.y);
	}

	onMouseOver() {
		this.setTimeZero = true;

		this.magnification.current = 0.05;

		this.program.uniforms.uHover.value = true;
		this.program.uniforms.uFirstWave.value = true;
	}

	onMouseOut() {
		this.magnification.isLearping = true;
		this.magnification.target = 0;
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

	updateX(x = 0) {
		this.x = (this.bounds.left + x) / window.innerWidth;

		this.mesh.position.x =
			-this.sizes.width / 2 +
			this.mesh.scale.x / 2 +
			this.x * this.sizes.width +
			this.extra.x;
	}

	updateY(y = 0) {
		this.y = (this.bounds.top + y) / window.innerHeight;

		this.mesh.position.y =
			this.sizes.height / 2 -
			this.mesh.scale.y / 2 -
			this.y * this.sizes.height +
			this.extra.y;
	}

	update(scroll, gettedTime, speed) {
		this.updateX();
		this.updateY(scroll.y);

		this.program.uniforms.uScrollSpeed.value = speed.current;

		if (this.setTimeZero) {
			this.timeZero = gettedTime;
			this.setTimeZero = false;
		}

		this.finalTime = ((gettedTime - this.timeZero) % 10000) * 0.0001 - 0.05;
		this.infiniteTime = gettedTime * 0.0001;

		if (
			(gettedTime - this.timeZero) *
				0.0001 *
				this.program.uniforms.uSpeed.value >
				2 &&
			this.program.uniforms.uFirstWave.value
		) {
			this.program.uniforms.uFirstWave.value = false;
		} else if (
			((gettedTime - this.timeZero) % 10000) *
				0.0001 *
				this.program.uniforms.uSpeed.value >
			2
		) {
			this.setTimeZero = true;
		}

		if (this.magnification.isLearping) {
			this.magnification.lerp = lerp(
				this.magnification.current,
				this.magnification.target,
				this.magnification.ease
			);
			if (this.magnification.lerp < 0.01) {
				this.magnification.current = 0;
				this.magnification.isLearping = false;
			} else {
				this.magnification.current = this.magnification.lerp;
			}
		}

		this.program.uniforms.uMagnification.value = parseFloat(
			this.magnification.current
		);
		this.program.uniforms.uInfiniteTime.value = parseFloat(this.infiniteTime);
		this.program.uniforms.uTime.value = parseFloat(this.finalTime);
	}

	addEventListeners() {
		this.element.parentNode.parentNode.addEventListener(
			"mouseover",
			this.onMouseOverEvent
		);

		this.element.parentNode.parentNode.addEventListener(
			"mouseout",
			this.onMouseOutEvent
		);
	}
}
