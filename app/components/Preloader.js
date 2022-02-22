import { each } from "lodash";
import { Texture } from "ogl";
import GSAP from "gsap";

import Component from "classes/Component.js";

export default class Preloader extends Component {
	constructor({ canvas }) {
		super({
			element: ".preloader",
			elements: {
				number: ".preloader__number",
				images: document.querySelectorAll("img"),
			},
		});

		this.canvas = canvas;

		window.TEXTURES = {};

		this.create();

		this.length = 0;

		this.createLoader();
	}

	createLoader() {
		window.ASSETS.forEach((image) => {
			const texture = new Texture(this.canvas.gl, {
				generateMipmaps: false,
			});

			const media = new window.Image();

			media.crossOrigin = "anonymous";
			media.src = image;
			media.onload = (_) => {
				texture.image = media;

				this.onAssetLoaded();
			};

			window.TEXTURES[image] = texture;
		});
	}

	onAssetLoaded() {
		this.length += 1;

		const percent = this.length / window.ASSETS.length;

		this.elements.number.innerHTML = `${Math.round(percent * 100)}%`;

		if (percent === 1) {
			this.onLoaded();
		}
	}

	onLoaded() {
		return new Promise((resolve) => {
			this.animateOut = GSAP.timeline({
				delay: 2,
			});

			this.animateOut.to(this.element, {
				autoAlpha: 0,
			});

			this.animateOut.call(() => {
				this.emit("completed");
			});
		});
	}

	destroy() {
		this.element.parentNode.removeChild(this.element);
	}
}
