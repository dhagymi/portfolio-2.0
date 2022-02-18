import GSAP from "gsap";
import { each } from "lodash";
import prefix from "prefix";

import Animation from "classes/Animation.js";

export default class Magnetic extends Animation {
	constructor({ element, elements }) {
		super({ element, elements });

		console.log(this.element.children);

		this.elements.text = this.element.children;

		this.x = new Array(this.elements.text.length).fill(null).map((_) => {
			return {
				current: 0,
				target: 0,
			};
		});
		this.y = new Array(this.elements.text.length).fill(null).map((_) => {
			return {
				current: 0,
				target: 0,
			};
		});

		this.x.parent = { current: 0, target: 0 };
		this.y.parent = { current: 0, target: 0 };

		this.onMouseEnterEvent = this.onMouseEnter.bind(this);
		this.onMouseMoveEvent = this.onMouseMove.bind(this);
		this.onMouseLeaveEvent = this.onMouseLeave.bind(this);

		this.addEventListener();
	}

	animateIn() {}

	animateOut() {}

	onResize() {
		this.height = this.element.clientHeight;
	}

	onMouseEnter() {
		this.updatePosition();
	}

	onMouseMove({ clientX, clientY, target }) {
		each(this.elements.text, (element, index) => {
			this.calculateMovement({ clientX, clientY, target, element, index });
		});
		this.calculateMovement({ clientX, clientY, target });
	}

	onMouseLeave() {
		each(this.elements.text, (_, index) => {
			GSAP.to([this.x[index], this.y[index]], {
				current: 0,
				duration: 0.2,
				onComplete: (_) => window.cancelAnimationFrame(this.frame),
				target: 0,
			});
		});

		GSAP.to([this.x.parent, this.y.parent], {
			current: 0,
			duration: 0.2,
			onComplete: (_) => window.cancelAnimationFrame(this.frame),
			target: 0,
		});
	}

	calculateMovement({ clientX, clientY, target, element, index }) {
		const targetRect = target.getBoundingClientRect();

		const targetCentralTargetX = targetRect.left + targetRect.width / 2;
		const targetCentralTargetY = targetRect.top + targetRect.height / 2;

		const mouseRelativePositionX =
			((clientX - targetCentralTargetX) * 2 * 0.5) / targetRect.width;
		const mouseRelativePositionY =
			((clientY - targetCentralTargetY) * 2 * 0.5) / targetRect.height;

		if (element) {
			const elementRect = element.getBoundingClientRect();

			const difRectsTop = Math.abs(elementRect.top - targetRect.top);
			const difRectsBottom = Math.abs(elementRect.bottom - targetRect.bottom);
			const difRectsLeft = Math.abs(elementRect.left - targetRect.left);
			const difRectsRight = Math.abs(elementRect.right - targetRect.right);

			const xDifference = Math.min(difRectsLeft, difRectsRight);
			const yDifference = Math.min(difRectsTop, difRectsBottom);

			this.x[index].target = mouseRelativePositionX * xDifference;
			this.y[index].target = mouseRelativePositionY * yDifference;
		} else {
			this.x.parent.target = (mouseRelativePositionX * targetRect.width) / 2;
			this.y.parent.target = (mouseRelativePositionY * targetRect.height) / 2;
		}
	}

	updatePosition() {
		each(this.elements.text, (element, index) => {
			this.x[index].current = GSAP.utils.interpolate(
				this.x[index].current,
				this.x[index].target,
				0.1
			);
			this.y[index].current = GSAP.utils.interpolate(
				this.y[index].current,
				this.y[index].target,
				0.1
			);

			GSAP.set(element, {
				x: this.x[index].current,
				y: this.y[index].current,
			});
		});

		this.x.parent.current = GSAP.utils.interpolate(
			this.x.parent.current,
			this.x.parent.target,
			0.1
		);
		this.y.parent.current = GSAP.utils.interpolate(
			this.y.parent.current,
			this.y.parent.target,
			0.1
		);

		GSAP.set(this.element, {
			x: this.x.parent.current,
			y: this.y.parent.current,
		});

		this.frame = window.requestAnimationFrame(this.updatePosition.bind(this));
	}

	addEventListener() {
		this.element.addEventListener("mouseenter", this.onMouseEnterEvent);
		this.element.addEventListener("mousemove", this.onMouseMoveEvent);
		this.element.addEventListener("mouseleave", this.onMouseLeaveEvent);
	}

	removeEventListener() {
		this.element.removeEventListener("mouseenter", this.onMouseEnterEvent);
		this.element.removeEventListener("mousemove", this.onMouseMoveEvent);
		this.element.removeEventListener("mouseleave", this.onMouseLeaveEvent);
	}
}
