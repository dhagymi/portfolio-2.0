import prefix from "prefix";
import GSAP from "gsap";
import { each } from "lodash";

import Component from "classes/Component.js";

export default class Menu extends Component {
	constructor({ template }) {
		super({
			element: ".menu",
			elements: {
				logo: ".menu__header__logo",
				languageLinks: ".menu__header__languages__link",
				closeButton: ".menu__header__close",
				navLinks: ".menu__navigation__list__label",
			},
			generalComponents: {
				curtain: ".menu__curtain",
				stripes: ".header__responsiveMenuButton__stripe",
			},
		});

		this.transformPrefix = prefix("transform");
		this.transitionPrefix = prefix("transition");
		this.transitionDelayPrefix = prefix("transition-delay");
		this.animationDurationMS = 600;

		this.pageTemplate = template;

		this.onCloseClickEvent = this.onCloseClick.bind(this);
	}

	create() {
		super.create();

		this.hide();

		this.onChange(this.pageTemplate);

		this.activateLanguage();

		this.generalComponents.curtain.style[this.transitionPrefix] = `${
			this.transformPrefix
		} cubic-bezier(0.77, 0, 0.175, 1) 0.${
			this.animationDurationMS
		}s, border-radius linear 0.${Math.round(this.animationDurationMS * 1.33)}s`;

		each(this.generalComponents.stripes, (stripe) => {
			stripe.style[this.transitionPrefix] = `all 0.2s ease-out`;
		});

		alert(
			`${window.screen.availHeight}\n${window.innerHeight}\n${window.outerHeight}`
		);
	}

	desactivate() {
		each(this.elements.navLinks, (link) => {
			link.classList.remove("menu__navigation__list__label--active");
		});
	}

	activateLanguage() {
		this.languageSetted = window.location.pathname.split("/")[1];

		each(this.elements.languageLinks, (link) => {
			if (link.getAttribute("data-language") === this.languageSetted) {
				link.parentNode.classList.add("menu__header__languages__item--active");
			}
		});
	}

	setLanguageLinks() {
		each(this.elements.languageLinks, (link) => {
			link.setAttribute(
				"href",
				`/${link.dataset.language}/${
					this.pageTemplate === "home" ? "" : this.pageTemplate
				}`
			);
		});
	}

	/* Animations */
	show() {
		return new Promise((resolve) => {
			each(this.generalComponents.stripes, (stripe, index) => {
				stripe.classList.add(
					`header__responsiveMenuButton__stripe--${index + 1}--active`
				);

				stripe.style[this.transitionDelayPrefix] = `.${
					this.animationDurationMS - 200
				}s`;
			});

			this.showCurtains();

			this.timeline = GSAP.timeline();
			this.timeline.to(
				this.element,
				{ autoAlpha: 1, onComplete: resolve },
				`+=0.${this.animationDurationMS}`
			);

			this.isVisible = true;
		});
	}

	hide() {
		return new Promise((resolve) => {
			this.timeline = GSAP.timeline();
			this.timeline.to(this.element, {
				autoAlpha: 0,
				onComplete: () => {
					each(this.generalComponents.stripes, (stripe, index) => {
						stripe.classList.remove(
							`header__responsiveMenuButton__stripe--${index + 1}--active`
						);
						stripe.style[this.transitionDelayPrefix] = `0s`;
					});

					this.hideCurtains();
					resolve();
				},
			});

			this.isVisible = false;
		});
	}

	showCurtains() {
		this.generalComponents.curtain.classList.add("menu__curtain--active");
	}

	hideCurtains() {
		this.generalComponents.curtain.classList.remove("menu__curtain--active");
	}

	/* Events */
	onChange(template) {
		this.pageTemplate = template;

		each(this.elements.navLinks, (link) => {
			if (link.getAttribute("data-section") === template) {
				link.classList.add("menu__navigation__list__label--active");
			}
		});

		this.setLanguageLinks();
	}

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
