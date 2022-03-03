import GSAP from "gsap";
import normalizeWheel from "normalize-wheel";
import prefix from "prefix";
import { each, map } from "lodash";

import Fade from "animations/Fade.js";
import Magnetic from "animations/Magnetic.js";

import Scroll from "classes/Scroll.js";
import AsyncLoad from "classes/AsyncLoad.js";

export default class Page {
	constructor({ id, element, elements, title }) {
		this.selector = element;
		this.selectorChildren = {
			...elements,

			animationsFades: '[data-animationfade="true"]',
			animationsMagnetic: '[data-animationmagnetic="true"]',

			preloaders: "[data-src]",
		};
		this.title = title;

		this.id = id;
		this.transformPrefix = prefix("transform");

		this.onMouseWheelEvent = this.onMouseWheel.bind(this);
		this.onTouchDownEvent = this.onTouchDown.bind(this);
		this.onTouchMoveEvent = this.onTouchMove.bind(this);
		this.onTouchUpEvent = this.onTouchUp.bind(this);
	}

	create() {
		this.element = document.querySelector(this.selector);
		this.elements = {};

		this.scroll = new Scroll({ ease: 0.1 });

		this.y = {
			start: 0,
			difference: 0,
			end: 0,
		};

		each(this.selectorChildren, (selector, key) => {
			if (
				selector instanceof window.HTMLElement ||
				selector instanceof window.NodeList
			) {
				this.elements[key] = selector;
			} else if (Array.isArray(selector)) {
				this.elements[key] = selector;
			} else {
				this.elements[key] = this.element.querySelectorAll(selector);

				if (this.elements[key].length === 0) {
					this.elements[key] = null;
				} else if (this.elements[key].length === 1) {
					this.elements[key] = this.element.querySelector(selector);
				}
			}
		});

		this.createAnimations();

		this.createPreloader();
	}

	createAnimations() {
		if (this.elements.animationsFades?.length > 1) {
			this.animationsFades = map(this.elements.animationsFades, (element) => {
				return new Fade({ element });
			});
		} else if (this.elements.animationsFades) {
			this.animationsFades = [
				new Fade({ element: this.elements.animationsFades }),
			];
		}

		if (this.elements.animationsMagnetic?.length > 1) {
			this.animationsMagnetic = map(
				this.elements.animationsMagnetic,
				(element) => {
					return new Magnetic({ element, elements: { text: "span" } });
				}
			);
		} else if (this.elements.animationsMagnetic) {
			this.animationsMagnetic = [
				new Magnetic({
					element: this.elements.animationsMagnetic,
					elements: { text: "span" },
				}),
			];
		}
	}

	createPreloader() {
		if (this.elements.preloaders?.length) {
			this.preloaders = map(this.elements.preloaders, (element) => {
				return new AsyncLoad({ element });
			});
		} else if (this.elements.preloaders) {
			this.preloaders = new AsyncLoad({ element: this.elements.preloaders });
		}
	}

	/* Animations */

	show() {
		return new Promise((resolve) => {
			this.animationIn = GSAP.timeline();
			this.animationIn.fromTo(
				this.element,
				{ autoAlpha: 0 },
				{
					autoAlpha: 1,
				}
			);

			this.animationIn.call(() => {
				this.addEventListeners();
				this.showed = true;

				resolve();
			});
		});
	}

	hide() {
		return new Promise(async (resolve) => {
			await this.destroy();
			this.showed = false;

			this.animationOut = GSAP.timeline();

			this.animationOut.to(this.element, {
				autoAlpha: 0,
				onComplete: resolve,
			});
		});
	}

	showElement(element) {
		return new Promise((resolve) => {
			this.animationIn = GSAP.timeline();
			this.animationIn.fromTo(
				element,
				{ autoAlpha: 0 },
				{
					autoAlpha: 1,
				}
			);

			this.animationIn.call(() => {
				resolve();
			});
		});
	}

	hideElement(element) {
		return new Promise((resolve) => {
			this.animationOut = GSAP.timeline();

			this.animationOut.to(element, {
				autoAlpha: 0,
				onComplete: resolve,
			});
		});
	}

	/* Loops */

	update() {
		this.scroll.interpolate();

		if (this.elements.wrapper) {
			this.elements.wrapper.style[
				this.transformPrefix
			] = `translateY(-${this.scroll.current}px)`;
		}
	}

	updateScroll(params) {
		this.scroll.updateParams(params);
	}

	/* Events */

	onMouseWheel(event) {
		const { pixelY } = normalizeWheel(event);

		this.scroll.target += pixelY;
	}

	onTouchDown(event) {
		this.isTouching = true;

		this.y.start = event.touches[0].clientY;
	}

	onTouchMove(event) {
		if (!this.isTouching) return;

		this.y.end = event.touches[0].clientY;

		this.y.difference = this.y.start - this.y.end;
		this.y.start = this.y.end;
		this.scroll.target += this.y.difference * 4;
	}

	onTouchUp(event) {
		this.isTouching = false;

		this.y.end = event.changedTouches[0].clientY;

		this.y.difference = this.y.start - this.y.end;

		this.scroll.target += this.y.difference * 4;
	}

	onResize() {
		if (this.elements.wrapper) {
			this.scroll.limit =
				this.elements.wrapper.clientHeight - window.innerHeight;
			this.scroll.target = 0;
		}
	}

	/* Listeners */

	addEventListeners() {
		window.addEventListener("mousewheel", this.onMouseWheelEvent);
		window.addEventListener("touchstart", this.onTouchDownEvent);
		window.addEventListener("touchmove", this.onTouchMoveEvent);
		window.addEventListener("touchend", this.onTouchUpEvent);
	}

	removeEventListeners() {
		window.addEventListener("mousewheel", this.onMouseWheelEvent);
		window.addEventListener("touchstart", this.onTouchDownEvent);
		window.addEventListener("touchmove", this.onTouchMoveEvent);
		window.addEventListener("touchend", this.onTouchUpEvent);
	}

	/* Destroy */

	destroy() {
		this.removeEventListeners();
	}
}
