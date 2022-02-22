import { each } from "lodash";
import prefix from "prefix";

import Page from "classes/Page.js";

export default class Works extends Page {
	constructor() {
		super({
			id: "works",
			element: ".works",
			elements: {
				wrapper: ".works__wrapper",
				cards: ".works__card",
				cardsWrapper: ".works__cardsWrapper",
			},
			title: { en: "Works", es: "Trabajos" },
		});

		this.gridColumnPrefix = prefix("grid-column");
		this.gridRowPrefix = prefix("grid-row");
		this.aspectRatioPrefix = prefix("aspect-ratio");
	}

	create() {
		super.create();

		this.positionCards();
	}

	positionCards() {
		each(this.elements.cards, (card) => {
			const aspectRatio = 1 / (Math.random() * 0.25 + 1);
			const number = parseInt(
				[...card.classList]
					.find((cssClass) => cssClass.includes("--"))
					.split("--")[1]
			);

			card.style.width = `${100 - Math.random() * 40}%`;
			card.style[this.aspectRatioPrefix] = `${aspectRatio}`;

			card.style[this.gridRowPrefix] = `${number}/${number + 1}`;
			card.style[this.gridColumnPrefix] = `${number % 2 === 0 ? 2 : 1}/${
				number % 2 === 0 ? 3 : 2
			}`;
		});
	}

	update() {
		this.scroll.interpolate();

		if (this.elements.cardsWrapper) {
			this.elements.cardsWrapper.style[
				this.transformPrefix
			] = `translateY(-${this.scroll.current}px)`;
		}
	}

	onResize() {
		if (this.elements.cardsWrapper) {
			this.scroll.limit =
				this.elements.cardsWrapper.clientHeight - window.innerHeight;
			this.scroll.target = 0;
		}
	}
}
