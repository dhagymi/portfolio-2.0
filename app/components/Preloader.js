import { each } from "lodash";
import GSAP from "gsap";

import Component from "classes/Component.js";

export default class Preloader extends Component {
	constructor() {
		super({
			element: ".preloader",
			elements: {
				number: ".preloader__number",
				images: document.querySelectorAll("img"),
			},
		});

		this.create();

		this.length = 0;

		this.createLoader();
	}

	createLoader() {
		each(this.elements.images, (element) => {
			const image = new Image();
			image.addEventListener("load", () => this.onAssetLoaded(true));
			image.src = element.getAttribute("data-src");
		});

		if (this.elements.images.length === 0) {
			this.onAssetLoaded(false);
		}
	}

	onAssetLoaded(haveLength) {
		this.length += 1;

		this.charge = haveLength ? this.length / this.elements.images.length : 1;

		this.elements.number.innerHTML = `${Math.round(this.charge * 100)}%`;

		if (this.charge === 1) {
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
