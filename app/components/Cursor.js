import prefix from "prefix";
import GSAP from "gsap";

import Component from "classes/Component.js";

import { lerp, clamp } from "utils/math.js";

export default class Cursor extends Component {
	constructor() {
		super({ element: ".cursor", elements: { circle: ".cursor__circle" } });

		this.onMouseMoveEvent = this.onMouseMove.bind(this);

		this.topPrefix = prefix("top");
		this.leftPrefix = prefix("left");
	}

	create() {
		super.create();

		this.cursor = {
			ease: 0.2,
			currentX: 0,
			targetX: 0,
			currentY: 0,
			targetY: 0,
		};
	}

	update(available = true) {
		this.availableToUpdate = available;

		if (this.availableToUpdate) {
			this.cursor.targetX = clamp(0, this.cursor.limit, this.cursor.targetX);

			if (
				lerp(this.cursor.currentX, this.cursor.targetX, this.cursor.ease) < 0.01
			) {
				this.cursor.currentX = 0;
			} else {
				this.cursor.currentX = lerp(
					this.cursor.currentX,
					this.cursor.targetX,
					this.cursor.ease
				);
			}
			this.cursor.targetY = clamp(0, this.cursor.limit, this.cursor.targetY);

			if (
				lerp(this.cursor.currentY, this.cursor.targetY, this.cursor.ease) < 0.01
			) {
				this.cursor.currentY = 0;
			} else {
				this.cursor.currentY = lerp(
					this.cursor.currentY,
					this.cursor.targetY,
					this.cursor.ease
				);
			}

			if (this.element) {
				this.elements.circle.style[
					this.topPrefix
				] = `${this.cursor.currentY}px`;

				this.elements.circle.style[
					this.leftPrefix
				] = `${this.cursor.currentX}px`;
			}
		}
	}

	/* Animations */
	show() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { opacity: 1, onComplete: resolve });
		});
	}

	hide() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { opacity: 0, onComplete: resolve });
		});
	}

	/* Event */

	onMouseMove(event) {
		this.yPosition = event.pageY;
		this.xPosition = event.pageX;

		this.cursor.targetY = this.yPosition;
		this.cursor.targetX = this.xPosition;
	}

	/* Listeners */

	addEventListeners() {
		window.addEventListener("mousemove", this.onMouseMoveEvent);
	}
}
