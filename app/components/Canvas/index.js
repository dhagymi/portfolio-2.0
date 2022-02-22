import { Camera, Renderer, Transform } from "ogl";
import normalizeWheel from "normalize-wheel";

import Works from "./Works/index.js";

export default class Canvas {
	constructor({ template }) {
		this.template = template;

		this.x = {
			start: 0,
			distance: 0,
			end: 0,
		};

		this.y = {
			start: 0,
			distance: 0,
			end: 0,
		};

		this.createRenderer();
		this.createCamera();
		this.createScene();

		this.onTouchDownEvent = this.onTouchDown.bind(this);
		this.onTouchMoveEvent = this.onTouchMove.bind(this);
		this.onTouchUpEvent = this.onTouchUp.bind(this);
		this.onWheelEvent = this.onWheel.bind(this);

		this.onResize();

		this.addEventListeners();
	}

	createRenderer() {
		this.renderer = new Renderer({
			alpha: true,
			antialias: true,
		});

		this.gl = this.renderer.gl;

		document.body.appendChild(this.gl.canvas);
	}

	createCamera() {
		this.camera = new Camera(this.gl);
		this.camera.position.z = 5;
	}

	createScene() {
		this.scene = new Transform();
	}

	/**
	 * Works.
	 */
	createWorks() {
		this.works = new Works({
			gl: this.gl,
			scene: this.scene,
			sizes: this.sizes,
		});
	}

	destroyWorks() {
		if (!this.works) return;

		this.works.destroy();
		this.works = null;
	}

	/**
	 * Events.
	 */
	onPreloaded() {
		if (this.template === "works") {
			this.createWorks();
		}

		this.onChange(this.template, true);
	}

	onChange(template, isPreloaded) {
		if (template === "works") {
			this.createWorks();
			this.works.show(isPreloaded);
		} else if (this.works) {
			this.destroyWorks();
		}

		this.template = template;
	}

	onChangeStart() {
		if (this.works && this.works.hide) this.works.hide();
	}

	onResize() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.camera.perspective({
			aspect: window.innerWidth / window.innerHeight,
		});

		const fov = this.camera.fov * (Math.PI / 180);
		const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
		const width = height * this.camera.aspect;

		this.sizes = {
			height,
			width,
		};

		const values = {
			sizes: this.sizes,
		};

		if (this.works) {
			this.works.onResize(values);
		}
	}

	onTouchDown(event) {
		this.isDown = true;

		this.x.start = event.touches ? event.touches[0].clientX : event.clientX;
		this.y.start = event.touches ? event.touches[0].clientY : event.clientY;

		const values = {
			x: this.x,
			y: this.y,
		};

		if (this.works) {
			this.works.onTouchDown(values);
		}
	}

	onTouchMove(event) {
		const x = event.touches ? event.touches[0].clientX : event.clientX;
		const y = event.touches ? event.touches[0].clientY : event.clientY;

		this.x.end = x;
		this.y.end = y;

		const values = {
			x: this.x,
			y: this.y,
		};

		if (!this.isDown) return;

		if (this.works) {
			this.works.onTouchMove(values);
		}
	}

	onTouchUp(event) {
		this.isDown = false;

		const x = event.changedTouches
			? event.changedTouches[0].clientX
			: event.clientX;
		const y = event.changedTouches
			? event.changedTouches[0].clientY
			: event.clientY;

		this.x.end = x;
		this.y.end = y;

		const values = {
			x: this.x,
			y: this.y,
		};

		if (this.works) {
			this.works.onTouchUp(values);
		}
	}

	onWheel(event) {
		const { pixelY } = normalizeWheel(event);

		if (this.works) {
			this.works.onWheel({ pixelY });
		}
	}

	/**
	 * Loop.
	 */
	update(scroll, time) {
		if (this.works) {
			this.works.update(time);
		}

		this.renderer.render({
			camera: this.camera,
			scene: this.scene,
		});
	}

	/**
	 * Listeners
	 */

	addEventListeners() {
		window.addEventListener("touchstart", this.onTouchDownEvent);
		window.addEventListener("touchmove", this.onTouchMoveEvent);
		window.addEventListener("touchend", this.onTouchUpEvent);
		window.addEventListener("mousewheel", this.onWheelEvent);
	}
}
