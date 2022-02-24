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

		this.scrollCurrent = {
			x: 0,
			y: 0,
		};

		this.scroll = {
			x: 0,
			y: 0,
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

		this.scroll.y = this.y.target = 0;
		this.y.limit = this.galleryBounds.height - window.innerHeight;

		map(this.medias, (media) => media.onResize(event, this.scroll));
	}

	onTouchDown({ x, y }) {
		this.scrollCurrent.x = this.scroll.x;
		this.scrollCurrent.y = this.scroll.y;
	}

	onTouchMove({ x, y }) {
		const yDistance = y.start - y.end;

		this.y.target = this.scrollCurrent.y - yDistance;
	}

	onTouchUp({ x, y }) {}

	onWheel({ pixelX, pixelY }) {
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

		if (this.scroll.y < this.y.current) {
			this.y.direction = "top";
		} else if (this.scroll.y > this.y.current) {
			this.y.direction = "bottom";
		}

		this.scroll.y = this.y.current;

		map(this.medias, (media, index) => {
			const offsetY = this.sizes.height * 0.5;
			const scaleY = media.mesh.scale.y / 2;

			if (this.y.direction === "top") {
				const y = media.mesh.position.y + scaleY;

				if (y < -offsetY) {
					media.extra.y += this.gallerySizes.height;
				}
			} else if (this.y.direction === "bottom") {
				const y = media.mesh.position.y - scaleY;

				if (y > offsetY) {
					media.extra.y -= this.gallerySizes.height;
				}
			}

			media.update(this.scroll, time, this.speed);
		});
	}

	/**
	 * Destroy.
	 */
	destroy() {
		this.scene.removeChild(this.group);
	}
}
