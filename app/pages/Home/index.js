import Page from "classes/Page.js";

export default class Home extends Page {
	constructor() {
		super({
			id: "home",
			element: ".home",
			elements: {
				wrapper: ".home__wrapper",
				micaCard: ".home__card--mica",
				agusCard: ".home__card--agus",
				argentinaLabel: ".home__title__line--4",
				germanyLabel: ".home__title__line--5",
			},
			title: {
				en: "Developers & Designers",
				es: "Desarrolladores y diseñadores",
			},
		});
	}

	create() {
		super.create();

		this.fadeByHover(this.elements.argentinaLabel, this.elements.agusCard);
		this.fadeByHover(this.elements.germanyLabel, this.elements.micaCard);
	}

	fadeByHover(hoverElement, fadeElement) {
		hoverElement.addEventListener("mouseover", () => {
			this.showElement(fadeElement);
		});
		hoverElement.addEventListener("mouseout", () => {
			this.hideElement(fadeElement);
		});
	}
}
