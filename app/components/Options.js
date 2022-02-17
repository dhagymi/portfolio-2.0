import { each } from "lodash";

import Component from "classes/Component.js";

export default class Options extends Component {
	constructor({ template, interactionComponents }) {
		super({
			element: ".options",
			elements: {
				header: ".header",
				footer: ".footer",
				navLabel: ".header__navigation__list__label",
				languageLabel: ".footer__list__label",
				languageLink: ".footer__list__link",
				menuButton: ".header__responsiveMenuButton",
			},
			isScrolleable: false,
		});

		this.pageTemplate = template;

		this.interactionComponents = interactionComponents;

		this.onMenuClickEvent = this.onMenuClick.bind(this);
	}

	create() {
		super.create();

		this.interactionComponents.menu.create();

		this.onChange(this.pageTemplate);

		this.activateLanguage();
	}

	desactivate() {
		each(this.elements.navLabel, (label) => {
			label.classList.remove("header__navigation__list__label--active");
		});
	}

	activateLanguage() {
		this.languageSetted = window.location.pathname.split("/")[1];

		each(this.elements.languageLabel, (label) => {
			if (label.getAttribute("data-language") === this.languageSetted) {
				label.classList.add("footer__list__label--active");
			}
		});
	}

	setLanguageLinks() {
		each(this.elements.languageLink, (link) => {
			link.setAttribute(
				"href",
				`/${link.children[0].dataset.language}/${
					this.pageTemplate === "home" ? "" : this.pageTemplate
				}`
			);
		});
	}

	/* Events */

	onMenuClick() {
		if (this.interactionComponents.menu.isVisible) {
			this.interactionComponents.menu.hide();
		} else {
			this.interactionComponents.menu.show();
		}
	}

	onChange(template) {
		this.pageTemplate = template;

		each(this.elements.navLabel, (label) => {
			if (label.getAttribute("data-section") === template) {
				label.classList.add("header__navigation__list__label--active");
			}
		});

		this.setLanguageLinks();
	}

	addEventListeners() {
		super.addEventListeners();
		this.elements.menuButton.addEventListener("click", this.onMenuClickEvent);
	}
}
