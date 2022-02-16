import GSAP from "gsap";

import Component from "classes/Component.js";

export default class Menu extends Component {
	constructor({ template }) {
		super({
			element: ".menu",
			elements: {
				logo: ".menu__header__logo",
				languagesButtons: ".menu__header__languages__item",
				closeButton: ".menu__header__close",
				navLinks: ".menu__navigation__list__label",
			},
		});

		this.onCloseClickEvent = this.onCloseClick.bind(this);
		this.onChange(template);
	}

	create() {
		super.create();

		this.hide();
	}

	/* Animations */
	show() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { autoAlpha: 1, onComplete: resolve });

			this.isVisible = true;
		});
	}

	hide() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, { autoAlpha: 0, onComplete: resolve });

			this.isVisible = false;
		});
	}

	/* Events */
	onChange(template) {}

	onCloseClick() {
		this.hide();
	}

	/* Listeners */

	addEventListeners() {
		super.addEventListeners();
		this.elements.closeButton.addEventListener("click", this.onCloseClickEvent);
		this.elements.navLinks.forEach((link) => {
			link.addEventListener("click", this.onCloseClickEvent);
		});
		this.elements.logo.addEventListener("click", this.onCloseClickEvent);
	}
}
