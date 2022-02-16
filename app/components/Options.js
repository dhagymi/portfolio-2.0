import Component from "classes/Component.js";

export default class Options extends Component {
	constructor({ template, interactionComponents }) {
		super({
			element: ".options",
			elements: {
				header: ".header",
				footer: ".footer",
				navLabel: ".header__navigation__list__label",
				menuButton: ".header__responsiveMenuButton",
			},
			generalComponents: {
				arrow: ".options__arrow",
			},
			isScrolleable: false,
		});

		this.interactionComponents = interactionComponents;

		this.onChange(template);
		this.onMenuClickEvent = this.onMenuClick.bind(this);
	}

	create() {
		super.create();

		this.interactionComponents.menu.create();
	}

	onMenuClick() {
		if (this.interactionComponents.menu.isVisible) {
			this.interactionComponents.menu.hide();
		} else {
			this.interactionComponents.menu.show();
		}
	}

	onChange(template) {}

	addEventListeners() {
		super.addEventListeners();
		this.elements.menuButton.addEventListener("click", this.onMenuClickEvent);
	}
}
