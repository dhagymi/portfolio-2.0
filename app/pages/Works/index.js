import { each, map } from "lodash";
import prefix from "prefix";

import Fade from "animations/Fade.js";

import deviceDetection from "classes/DeviceDetection.js";
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
				title: ".works__title",

				worksAnimationsFades: '[data-worksanimationfade="true"]',
			},
			title: { en: "Works", es: "Trabajos" },
		});

		this.gridColumnPrefix = prefix("grid-column");
		this.gridRowPrefix = prefix("grid-row");
		this.aspectRatioPrefix = prefix("aspect-ratio");
		this.gridTemplateRowsPrefix = prefix("grid-template-rows");
		this.gridTemplateColumnsPrefix = prefix("grid-template-columns");
		this.gridGapPrefix = prefix("grid-gap");
	}

	create() {
		super.create();

		this.positionCards();
	}

	createAnimations() {
		super.createAnimations();

		if (deviceDetection.isPhone()) {
			if (this.elements.worksAnimationsFades?.length > 1) {
				this.worksAnimationsFades = map(
					this.elements.worksAnimationsFades,
					(element) => {
						return new Fade({ element });
					}
				);
			} else if (this.elements.worksAnimationsFades) {
				this.worksAnimationsFades = [
					new Fade({ element: this.elements.worksAnimationsFades }),
				];
			}
		}
	}

	positionCards() {
		if (!deviceDetection.isPhone()) {
			each(this.elements.cards, (card) => {
				const aspectRatio = 1 / (Math.random() * 0.25 + 1);
				const number = parseInt(
					[...card.classList]
						.find((cssClass) => cssClass.includes("--"))
						.split("--")[1]
				);

				card.style.width = `${100 - Math.random() * 40}%`;
				card.style.height = `${
					card.getBoundingClientRect().width / aspectRatio
				}px`;

				card.style[this.gridRowPrefix] = `${number}/${number + 1}`;
				card.style[this.gridColumnPrefix] = `${number % 2 === 0 ? 2 : 1}/${
					number % 2 === 0 ? 3 : 2
				}`;
			});
		} else {
			each(this.elements.cards, (card) => {
				const number = parseInt(
					[...card.classList]
						.find((cssClass) => cssClass.includes("--"))
						.split("--")[1]
				);

				card.style.width = `${card.getBoundingClientRect().height}px`;
				card.style.height = `100%`;

				card.style[this.gridRowPrefix] = `${number}/${number + 1}`;

				card.children[0].children[1].style.opacity = "1";
				card.children[0].children[1].style.visibility = "visible";

				card.children[0].children[0].style.fontSize = "2rem";
				card.children[0].children[0].style.margin = "1rem 0";
				card.children[0].children[0].style.top = "100%";
				card.children[0].children[0].style.left = "0";
			});

			this.elements.cardsWrapper.style[this.gridTemplateColumnsPrefix] = "1fr";
			this.elements.cardsWrapper.style[
				this.gridTemplateRowsPrefix
			] = `repeat(${this.elements.cards.length}, 30rem)`;
			this.elements.cardsWrapper.style[this.gridGapPrefix] = `7rem`;
			this.elements.cardsWrapper.style.padding = `27rem 1rem 12rem`;

			this.elements.title.style.left = "5rem";
			this.elements.title.style.top = "0";
			this.elements.title.style.marginTop = "16rem";
			this.elements.title.style.width = "100%";
			this.elements.title.style.textAlign = "left";
		}
	}

	update() {
		this.scroll.interpolate();

		if (this.elements.cardsWrapper) {
			this.elements.cardsWrapper.style[
				this.transformPrefix
			] = `translateY(-${this.scroll.current}px)`;
		}

		if (deviceDetection.isPhone() && this.elements.title) {
			this.elements.title.style[
				this.transformPrefix
			] = `translateY(-${this.scroll.current}px)`;
		}
	}

	onResize() {
		this.positionCards();

		if (this.elements.cardsWrapper) {
			this.scroll.limit =
				this.elements.cardsWrapper.clientHeight - window.innerHeight;
			this.scroll.target = 0;
		}
	}
}
