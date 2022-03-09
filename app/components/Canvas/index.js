import { Camera, Renderer, Transform } from "ogl";
import normalizeWheel from "normalize-wheel";

import deviceDetection from "classes/DeviceDetection.js";

import Works from "./Works/index.js";
import General from "./General/index.js";

export default class Canvas {
	constructor({ template, general }) {
		this.template = template;
		this.isGeneral = general;

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

		if (!deviceDetection.isPhone() || this.isGeneral) {
			document.body.appendChild(this.gl.canvas);
		}
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
	 * General
	 */

	createGeneral() {
		this.general = new General({
			gl: this.gl,
			scene: this.scene,
			sizes: this.sizes,
		});
	}

	/**
	 * Events.
	 */
	onPreloaded() {
		if (this.isGeneral) {
			this.createGeneral();
		} else {
			if (this.template === "works") {
				this.createWorks();
			}
		}

		this.onChange(this.template, true);
	}

	onChange(template, isPreloaded) {
		if (this.isGeneral) {
			this.general.show(isPreloaded);
		} else {
			if (template === "works") {
				this.works.show(isPreloaded);
			} else if (this.works) {
				this.destroyWorks();
			}
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

		if (this.isGeneral && this.general) {
			this.general.onResize(values);
		}

		if (this.works) {
			this.works.onResize(values);
		}
	}

	onTouchDown(event) {
		if (this.isGeneral) return;

		this.isTouching = true;

		this.y.start = event.touches[0].clientY;

		const values = {
			x: this.x,
			y: this.y,
		};

		if (this.works) {
			this.works.onTouchDown(values);
		}
	}

	onTouchMove(event) {
		if (this.isGeneral) return;

		if (!this.isTouching) return;

		this.y.end = event.touches[0].clientY;

		this.y.difference = this.y.start - this.y.end;
		this.y.start = this.y.end;

		const values = {
			y: this.y,
		};

		if (this.works) {
			this.works.onTouchMove(values);
		}
	}

	onTouchUp(event) {
		if (this.isGeneral) return;

		this.isTouching = false;

		this.y.end = event.changedTouches[0].clientY;

		this.y.difference = this.y.start - this.y.end;

		const values = {
			y: this.y,
		};

		if (this.works) {
			this.works.onTouchUp(values);
		}
	}

	onWheel(event) {
		const { pixelY } = normalizeWheel(event);

		if (this.isGeneral) return;

		if (this.works) {
			this.works.onWheel({ pixelY });
		}
	}

	/**
	 * Loop.
	 */
	update(scroll, time) {
		if (!this.isGeneral) {
			if (this.works) {
				this.works.update(time);
			}
		} else if (this.general) {
			this.general.update(time);
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
