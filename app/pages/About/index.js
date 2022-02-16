import GSAP from "gsap";
import normalizeWheel from "normalize-wheel";
import prefix from "prefix";

import Page from "classes/Page.js";

import { clamp, lerp } from "utils/math.js";

export default class About extends Page {
	constructor() {
		super({
			id: "about",
			element: ".about",
			elements: {
				wrapper: ".about__wrapper",
				developerStripe: ".about__animatedText--1",
				designerStripe: ".about__animatedText--2",
			},
			title: "",
		});

		this.transformPrefix = prefix("transform");

		this.isStripesAnimationInversed = false;

		this.onMouseWheelStripesEvent = this.onMouseWheelStripes.bind(this);
		this.onTouchDownStripesEvent = this.onTouchDownStripes.bind(this);
		this.onTouchMoveStripesEvent = this.onTouchMoveStripes.bind(this);
		this.onTouchUpStripesEvent = this.onTouchUpStripes.bind(this);
	}

	/* Main */

	async create() {
		super.create();

		this.developerDeltaY = 0;
		this.designerDeltaY = 0;

		await this.createStripes();
	}

	async destroy() {
		super.destroy();

		this.removeStripes();
	}

	/* Stripes */

	async createStripes() {
		this.stripesContainer = document.createElement("div");
		this.stripesContainer.classList.add(".about__animatedText__container");

		this.stripesContainer.appendChild(this.elements.developerStripe);
		this.stripesContainer.appendChild(this.elements.designerStripe);

		document.body.appendChild(this.stripesContainer);

		this.developerSeedSpan = {
			element: this.elements.developerStripe.children[0],
		};
		this.designerSeedSpan = {
			element: this.elements.designerStripe.children[0],
		};
	}

	async removeStripes() {
		await this.hideStripes();

		document.body.removeChild(this.stripesContainer);
	}

	async resizeStripes() {
		this.developerSeedSpan.width =
			this.developerSeedSpan.element.getBoundingClientRect().height;
		this.designerSeedSpan.width =
			this.designerSeedSpan.element.getBoundingClientRect().height;

		this.developerSpansNeeded = Math.round(
			window.innerHeight / this.developerSeedSpan.width
		);
		this.designerSpansNeeded = Math.round(
			window.innerHeight / this.designerSeedSpan.width
		);

		await this.addSpans(
			this.developerSpansNeeded,
			this.developerSeedSpan.element,
			this.elements.developerStripe
		);

		await this.addSpans(
			this.designerSpansNeeded,
			this.designerSeedSpan.element,
			this.elements.designerStripe
		);
	}

	resetStripes() {
		this.elements.developerStripe.textContent = "";
		this.elements.designerStripe.textContent = "";

		this.elements.developerStripe.appendChild(this.developerSeedSpan.element);
		this.elements.designerStripe.appendChild(this.designerSeedSpan.element);
	}

	addSpans(quantity, seedSpan, stripe) {
		return new Promise((resolve) => {
			for (let index = 1; index < quantity + 5; index++) {
				const newChild = seedSpan.cloneNode(true);

				if (index % 2 != 0) {
					newChild.classList.remove("about__animatedText__word--odd");
					newChild.classList.add("about__animatedText__word--pair");
				}

				stripe.appendChild(newChild);

				if (index === quantity) resolve();
			}
		});
	}

	showStripes() {
		return new Promise((resolve) => {
			this.elements.developerStripe.style.opacity = 1;
			this.elements.designerStripe.style.opacity = 1;

			this.animationIn = GSAP.timeline();
			this.animationIn.fromTo(
				this.stripesContainer,
				{ autoAlpha: 0 },
				{
					autoAlpha: 1,
				}
			);
			this.animationIn.call(() => {
				resolve();
			});
		});
	}

	hideStripes() {
		return new Promise((resolve) => {
			this.animationOut = GSAP.timeline();

			this.animationOut.to(this.stripesContainer, {
				autoAlpha: 0,
				onComplete: () => {
					this.elements.developerStripe.style.opacity = 0;
					this.elements.designerStripe.style.opacity = 0;

					resolve();
				},
			});
		});
	}

	/* Loop */

	update() {
		super.update();

		this.velocity = 1;

		this.velocity += clamp(
			0,
			15,
			Math.abs(this.scroll.current - this.scroll.target) * 0.05
		);

		this.directionMultiplier = this.isStripesAnimationInversed ? -1 : 1;

		this.developerDeltaY += this.velocity * this.directionMultiplier;
		this.designerDeltaY += this.velocity * this.directionMultiplier;

		if (
			this.developerDeltaY >= 2 * this.developerSeedSpan.width ||
			this.developerDeltaY <= -2 * this.developerSeedSpan.width
		) {
			this.developerPosition = 0;
			this.developerDeltaY = 0;
		} else {
			this.developerPosition = this.developerDeltaY;
		}

		if (
			this.designerDeltaY >= 2 * this.designerSeedSpan.width ||
			this.designerDeltaY <= -2 * this.designerSeedSpan.width
		) {
			this.designerPosition = 0;
			this.designerDeltaY = 0;
		} else {
			this.designerPosition = this.designerDeltaY;
		}

		this.elements.developerStripe.style[
			this.transformPrefix
		] = `translateX(calc(50vw - 50% - 2rem)) translateY(calc(50vh - 50% + ${this.developerPosition}px)) rotate(-90deg)`;
		this.elements.designerStripe.style[
			this.transformPrefix
		] = `translateX(calc(50vw - 50% + 2rem)) translateY(calc(50vh - 50% - ${this.designerPosition}px)) rotate(-90deg)`;
	}

	/* Events */

	async onResize(wrapper) {
		super.onResize(wrapper);

		if (this.showed) {
			await this.hideStripes();

			this.resetStripes();
		}

		await this.resizeStripes();

		await this.showStripes();
	}

	onMouseWheelStripes(event) {
		const { pixelY } = normalizeWheel(event);

		this.isStripesAnimationInversed = pixelY > 0;
	}

	onTouchDownStripes(event) {
		/* 		this.isTouching = true;

		this.y.start = event.touches[0].clientY; */
	}

	onTouchMoveStripes(event) {
		/* 		if (!this.isTouching) return;

		this.y.end = event.touches[0].clientY;

		this.y.difference = this.y.start - this.y.end;
		this.y.start = this.y.end;
		this.scroll.target += this.y.difference * 4; */
	}

	onTouchUpStripes(event) {
		/* 		this.isTouching = false;

		this.y.end = event.changedTouches[0].clientY;

		this.y.difference = this.y.start - this.y.end;

		this.scroll.target += this.y.difference * 4; */
	}

	/* Listeners */

	addEventListeners() {
		super.addEventListeners();

		window.addEventListener("mousewheel", this.onMouseWheelStripesEvent);
		window.addEventListener("touchstart", this.onTouchDownStripesEvent);
		window.addEventListener("touchmove", this.onTouchMoveStripesEvent);
		window.addEventListener("touchend", this.onTouchUpStripesEvent);
	}

	removeEventListeners() {
		super.removeEventListeners();

		window.removeEventListener("mousewheel", this.onMouseWheelStripesEvent);
		window.removeEventListener("touchstart", this.onTouchDownStripesEvent);
		window.removeEventListener("touchmove", this.onTouchMoveStripesEvent);
		window.removeEventListener("touchend", this.onTouchUpStripesEvent);
	}
}
