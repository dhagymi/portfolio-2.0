import { Plane, Transform } from "ogl";
import GSAP from "gsap";

import { map } from "lodash";

import { clamp } from "utils/math.js";

import Media from "./Media.js";

export default class {
	constructor({ gl, scene, sizes }) {
		this.gl = gl;
		this.scene = scene;
		this.sizes = sizes;

		this.group = new Transform();

		this.cardsWrapper = document.querySelector(".works__cardsWrapper");
		this.mediasElements = document.querySelectorAll(".works__card__image");

		this.y = {
			current: 0,
			target: 0,
			limit: 0,
			lerp: 0.1,
		};

		this.speed = {
			current: 0,
			target: 0,
			lerp: 0.1,
		};

		this.velocity = 0;

		this.createGeometry();
		this.createGallery();
	}

	createGeometry() {
		this.geometry = new Plane(this.gl, {
			heightSegments: 20,
			widthSegments: 20,
		});
	}

	createGallery() {
		this.medias = map(this.mediasElements, (element, index) => {
			return new Media({
				element,
				geometry: this.geometry,
				index,
				gl: this.gl,
				scene: this.group,
				sizes: this.sizes,
				aspectRatio: parseFloat(
					element.parentNode.parentNode.getBoundingClientRect().width /
						element.parentNode.parentNode.getBoundingClientRect().height
				),
			});
		});
	}

	/**
	 * Animations.
	 */
	show(isPreloaded) {
		this.group.setParent(this.scene);

		map(this.medias, (media) => media.show(isPreloaded));
	}

	hide() {
		map(this.medias, (media) => media.hide());
	}

	/**
	 * Events.
	 */
	onResize(event) {
		this.galleryBounds = this.cardsWrapper.getBoundingClientRect();

		this.sizes = event.sizes;

		this.gallerySizes = {
			height:
				(this.galleryBounds.height / window.innerHeight) * this.sizes.height,
			width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
		};

		this.y.limit = this.galleryBounds.height - window.innerHeight;

		this.y.current = 0;
		this.y.target = 0;

		map(this.medias, (media) => media.onResize(this.sizes));
	}

	onTouchDown({ y }) {}

	onTouchMove({ y }) {
		this.y.target -= y.difference * 4;
	}

	onTouchUp({ y }) {
		this.y.target -= y.difference * 4;
	}

	onWheel({ pixelY }) {
		this.y.target -= pixelY;
	}

	/**
	 * Update.
	 */
	update(time) {
		this.y.target += this.velocity;

		this.y.target = clamp(-this.y.limit, 0, this.y.target);

		this.speed.target = (this.y.target - this.y.current) * 0.001;
		this.speed.current = GSAP.utils.interpolate(
			this.speed.current,
			this.speed.target,
			this.speed.lerp
		);

		this.y.current = GSAP.utils.interpolate(
			this.y.current,
			this.y.target,
			this.y.lerp
		);

		map(this.medias, (media) => {
			media.update(this.y, time, this.speed);
		});
	}

	/**
	 * Destroy.
	 */
	destroy() {
		this.scene.removeChild(this.group);
	}
}
