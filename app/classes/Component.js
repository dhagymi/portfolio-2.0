import EventEmitter from "events";
import normalizeWheel from "normalize-wheel";
import prefix from "prefix";
import { map, each } from "lodash";
import GSAP from "gsap";

import Fade from "animations/Fade.js";

import Scroll from "classes/Scroll.js";

export default class Component extends EventEmitter {
	constructor({ element, elements, isScrolleable, generalComponents }) {
		super();

		this.selector = element;
		this.selectorChildren = {
			...elements,
			animationsFades: '[data-animation="fade"]',
		};
		this.generalSelectors = { ...generalComponents };

		this.isScrolleable = isScrolleable;
		this.transformPrefix = prefix("transform");

		this.onMouseWheelEvent = this.onMouseWheel.bind(this);
		this.onTouchDownEvent = this.onTouchDown.bind(this);
		this.onTouchMoveEvent = this.onTouchMove.bind(this);
		this.onTouchUpEvent = this.onTouchUp.bind(this);
	}

	/* Creates */
	create() {
		if (this.selector instanceof window.HTMLElement) {
			this.element = this.selector;
		} else {
			this.element = document.querySelector(this.selector);
		}
		this.elements = {};
		this.generalComponents = {};

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

		each(this.generalSelectors, (selector, key) => {
			if (
				selector instanceof window.HTMLElement ||
				selector instanceof window.NodeList
			) {
				this.generalComponents[key] = selector;
			} else if (Array.isArray(selector)) {
				this.generalComponents[key] = selector;
			} else {
				this.generalComponents[key] = document.querySelectorAll(selector);

				if (this.generalComponents[key].length === 0) {
					this.generalComponents[key] = null;
				} else if (this.generalComponents[key].length === 1) {
					this.generalComponents[key] = document.querySelector(selector);
				}
			}
		});

		this.createAnimations();

		this.addEventListeners();
	}

	/* Animations */
	createAnimations() {
		this.animationsFades = map(this.elements.animationsFades, (element) => {
			if (
				typeof element === "string" ||
				element instanceof window.HTMLElement ||
				element instanceof window.NodeList ||
				Array.isArray(element)
			)
				return new Fade({ element });
		});
	}

	show() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { autoAlpha: 1, onComplete: resolve });
		});
	}

	hide() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { autoAlpha: 0, onComplete: resolve });
		});
	}

	/* Loop */

	update(available = true) {
		this.availableToUpdate = available;

		if (this.availableToUpdate) {
			this.scroll.interpolate();

			if (this.element) {
				this.element.style[
					this.transformPrefix
				] = `translateY(-${this.scroll.current}px)`;
			}
		}
	}

	updateScroll(params) {
		this.scroll.updateParams(params);
	}

	/* Events */

	onMouseWheel(event) {
		if (this.availableToUpdate) {
			const { pixelY } = normalizeWheel(event);

			this.scroll.target += pixelY;
		}
	}

	onTouchDown(event) {
		if (this.availableToUpdate) {
			this.isTouching = true;

			this.y.start = event.touches[0].clientY;
		}
	}

	onTouchMove(event) {
		if (this.availableToUpdate) {
			if (!this.isTouching) return;

			this.y.end = event.touches[0].clientY;

			this.y.difference = this.y.start - this.y.end;
			this.y.start = this.y.end;
			this.scroll.target += this.y.difference * 4;
		}
	}

	onTouchUp(event) {
		if (this.availableToUpdate) {
			this.isTouching = false;

			this.y.end = event.changedTouches[0].clientY;

			this.y.difference = this.y.start - this.y.end;

			this.scroll.target += this.y.difference * 4;
		}
	}

	onResize(wrapper) {
		if (wrapper) {
			this.scroll.limit = wrapper.clientHeight - window.innerHeight;
		}
	}

	/* Listeners */

	addEventListeners() {
		if (this.isScrolleable) {
			window.addEventListener("mousewheel", this.onMouseWheelEvent);
			window.addEventListener("touchstart", this.onTouchDownEvent);
			window.addEventListener("touchmove", this.onTouchMoveEvent);
			window.addEventListener("touchend", this.onTouchUpEvent);
		}
	}

	removeEventListeners() {
		window.removeEventListener("mousewheel", this.onMouseWheelEvent);
		window.removeEventListener("touchstart", this.onTouchDownEvent);
		window.removeEventListener("touchmove", this.onTouchMoveEvent);
		window.removeEventListener("touchend", this.onTouchUpEvent);
	}
}
