import Component from "classes/Component.js";

export default class Arrow extends Component {
	constructor({ template }) {
		super({
			element: ".options__arrow",
			elements: { wrapper: ".options__arrow__wrapper" },
			isScrolleable: false,
		});

		this.template = template;
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

		this.viewportHeight = window.screen.availHeight;
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
}
