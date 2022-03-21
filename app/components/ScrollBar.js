import prefix from "prefix";
import GSAP from "gsap";
import normalizeWheel from "normalize-wheel";

import Component from "classes/Component.js";

export default class ScrollBar extends Component {
	constructor({ updateScroll }) {
		super({
			element: ".scrollBar",
			elements: {
				background: ".scrollBar__background",
				bar: ".scrollBar__bar",
			},
			isScrolleable: true,
		});

		this.topPrefix = prefix("top");
		this.onMouseOverEvent = this.onMouseOver.bind(this);
		this.onMouseLeaveEvent = this.onMouseLeave.bind(this);
		this.onScrollBackgroundClickEvent = this.onScrollBackgroundClick.bind(this);
		this.onTouchBarStartEvent = this.onTouchBarStart.bind(this);
		this.onTouchBarMoveEvent = this.onTouchBarMove.bind(this);
		this.onTouchBarEndEvent = this.onTouchBarEnd.bind(this);

		this.globalUpdateScroll = updateScroll;
	}

	async update(available = true) {
		this.availableToUpdate = available;

		if (this.availableToUpdate) {
			this.scroll.interpolate();

			this.percent = this.scroll.current / this.scroll.limit;

			if (this.elements.bar) {
				this.elements.bar.style[this.topPrefix] = `${
					(100 - this.barHeight) * this.percent
				}%`;
			}
		}
	}

	create() {
		super.create();
		this.hide();
		this.yBar = {
			start: 0,
			difference: 0,
			end: 0,
			realProportion: 0,
		};
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

	/* Events */
	onMouseWheel(event) {
		if (this.availableToUpdate) {
			const { pixelY } = normalizeWheel(event);
			this.scroll.target += pixelY;

			if (this.scroll.limit != 0) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.show();
				this.timer = setTimeout(() => {
					this.hide();
				}, 1500);
			}
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
			this.scroll.target += this.y.difference * 3;

			if (this.y.difference !== 0) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.show();
				this.timer = setTimeout(() => {
					this.hide();
				}, 1500);
			}
		}
	}

	onTouchUp(event) {
		if (this.availableToUpdate) {
			this.isTouching = false;

			this.y.end = event.changedTouches[0].clientY;

			this.y.difference = this.y.start - this.y.end;

			this.scroll.target += this.y.difference * 3;

			if (this.y.difference !== 0) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.show();
				this.timer = setTimeout(() => {
					this.hide();
				}, 1500);
			}
		}
	}

	onMouseOver() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.show();
	}

	onMouseLeave() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(() => {
			this.hide();
		}, 1500);
	}

	onScrollBackgroundClick(event) {
		this.clickHeightLevel = event.clientY / window.innerHeight;
		this.absoluteClickHeightLevel = this.clickHeightLevel * this.scroll.limit;
		this.globalUpdateScroll({ target: this.absoluteClickHeightLevel });
	}

	onTouchBarStart(event) {
		this.isBarTouching = true;
		this.yBar.start = event.touches ? event.touches[0].clientY : event.clientY;
	}

	onTouchBarMove(event) {
		if (!this.isBarTouching) return;

		this.yBar.end = event.touches ? event.touches[0].clientY : event.clientY;

		this.yBar.difference = this.yBar.start - this.yBar.end;

		this.yBar.start = this.yBar.end;

		this.yBar.realProportion =
			(this.yBar.end / window.innerHeight) * this.scroll.limit;

		this.globalUpdateScroll({
			target: this.yBar.realProportion,
		});

		if (this.yBar.difference !== 0) {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.show();
			this.timer = setTimeout(() => {
				this.hide();
			}, 1500);
		}
	}

	onTouchBarEnd(event) {
		if (!this.isBarTouching) return;

		this.isBarTouching = false;

		this.yBar.end = event.changedTouches
			? event.changedTouches[0].clientY
			: event.clientY;

		this.yBar.difference = this.yBar.start - this.yBar.end;

		this.yBar.realProportion =
			(this.yBar.end / window.innerHeight) * this.scroll.limit;

		this.globalUpdateScroll({
			target: this.yBar.realProportion,
		});
	}

	onResize(wrapper) {
		super.onResize(wrapper);
		this.barHeight = (window.innerHeight * 100) / wrapper.clientHeight;
		this.elements.bar.style.height = `${this.barHeight}%`;
	}

	onChange() {
		this.percent = 0;
		this.scroll.current = 0;
		this.scroll.target = 0;
	}

	/* Listeners */

	addEventListeners() {
		super.addEventListeners();
		this.element.addEventListener("mouseover", this.onMouseOverEvent);
		this.element.addEventListener("mouseleave", this.onMouseLeaveEvent);
		this.elements.bar.addEventListener("mousedown", this.onTouchBarStartEvent);
		this.elements.bar.addEventListener("mousemove", this.onTouchBarMoveEvent);
		this.elements.bar.addEventListener("mouseup", this.onTouchBarEndEvent);
		this.elements.bar.addEventListener("touchstart", this.onTouchBarStartEvent);
		this.elements.bar.addEventListener("touchmove", this.onTouchBarMoveEvent);
		this.elements.bar.addEventListener("touchend", this.onTouchBarEndEvent);
		this.elements.background.addEventListener(
			"click",
			this.onScrollBackgroundClickEvent
		);
		window.addEventListener("mousemove", this.onTouchBarMoveEvent);
		window.addEventListener("mouseup", this.onTouchBarEndEvent);
		window.addEventListener("touchmove", this.onTouchBarMoveEvent);
		window.addEventListener("touchend", this.onTouchBarEndEvent);
	}

	removeEventListeners() {
		super.removeEventListeners();
		this.element.removeEventListener("mouseover", this.onMouseOverEvent);
		this.element.removeEventListener("mouseleave", this.onMouseLeaveEvent);
		this.elements.bar.removeEventListener(
			"mousedown",
			this.onTouchBarStartEvent
		);
		this.elements.bar.removeEventListener(
			"mousemove",
			this.onTouchBarMoveEvent
		);
		this.elements.bar.removeEventListener("mouseup", this.onTouchBarEndEvent);
		this.elements.bar.removeEventListener(
			"touchstart",
			this.onTouchBarStartEvent
		);
		this.elements.bar.removeEventListener(
			"touchmove",
			this.onTouchBarMoveEvent
		);
		this.elements.bar.removeEventListener("touchend", this.onTouchBarEndEvent);
		this.elements.background.removeEventListener(
			"click",
			this.onScrollBackgroundClickEvent
		);
		window.removeEventListener("mousemove", this.onTouchBarMoveEvent);
		window.removeEventListener("mouseup", this.onTouchBarEndEvent);
		window.removeEventListener("touchmove", this.onTouchBarMoveEvent);
		window.removeEventListener("touchend", this.onTouchBarEndEvent);
	}
}
