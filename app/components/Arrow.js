import Component from "classes/Component.js";
import GSAP from "gsap";

export default class Arrow extends Component {
	constructor({ template }) {
		super({
			element: ".options__arrow",
			elements: { wrapper: ".options__arrow__wrapper" },
			isScrolleable: false,
			generalComponents: { cursor: ".cursor__circle" },
		});

		this.template = template;

		this.onMouseMoveEvent = this.onMouseMove.bind(this);
	}

	/* Loop */

	update(available, pageScroll) {
		super.update(available);

		if (
			!this.elements.wrapper.classList.contains(
				"options__arrow__wrapper--up"
			) &&
			Math.abs(pageScroll.target - pageScroll.limit) < 10
		) {
			this.elements.wrapper.classList.add("options__arrow__wrapper--up");
		} else if (
			this.elements.wrapper.classList.contains("options__arrow__wrapper--up") &&
			Math.abs(pageScroll.target - pageScroll.limit) > 10
		) {
			this.elements.wrapper.classList.remove("options__arrow__wrapper--up");
		}
	}

	/* Events */
	onResize(wrapper) {
		super.onResize(wrapper);

		this.hide();

		this.viewportHeight = window.innerHeight;
		this.element.style.height = `${this.viewportHeight}px`;

		if (
			!this.elements.wrapper.classList.contains(
				"options__arrow__wrapper--up"
			) &&
			Math.abs(wrapper.clientHeight - window.innerHeight) < 10
		) {
			this.elements.wrapper.classList.add("options__arrow__wrapper--up");
		} else if (
			this.elements.wrapper.classList.contains("options__arrow__wrapper--up") &&
			Math.abs(wrapper.clientHeight - window.innerHeight) > 10
		) {
			this.elements.wrapper.classList.remove("options__arrow__wrapper--up");
		}

		if (this.scroll.limit > 0) {
			setTimeout(() => {
				this.show();
			}, 500);
		}
	}

	onMouseMove({ clientX, clientY }) {
		const rect = this.elements.wrapper.getBoundingClientRect();

		if (
			clientX >= rect.left &&
			clientX <= rect.left + rect.width &&
			clientY >= rect.top &&
			clientY <= rect.top + rect.height
		) {
			if (
				!this.generalComponents.cursor.classList.contains(
					"cursor__circle--scroll"
				)
			)
				this.generalComponents.cursor.classList.add("cursor__circle--scroll");
		} else {
			if (
				this.generalComponents.cursor.classList.contains(
					"cursor__circle--scroll"
				)
			)
				this.generalComponents.cursor.classList.remove(
					"cursor__circle--scroll"
				);
		}
	}

	/* Animations */

	show() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { display: "block" });
			this.timeline.to(this.element, { autoAlpha: 1, onComplete: resolve });
		});
	}

	hide() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { autoAlpha: 0, onComplete: resolve });
			this.timeline.to(this.element, { display: "none" });
		});
	}

	/* Listeners */

	specialAddEventListeners() {
		window.addEventListener("mousemove", this.onMouseMoveEvent);
	}
}
