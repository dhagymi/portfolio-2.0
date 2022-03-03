import Component from "classes/Component.js";

export default class AsyncLoad extends Component {
	constructor({ element, loadByIntersecting = true }) {
		super({ element });
		this.loadByIntersecting = loadByIntersecting;

		this.create();

		this.setLoading();
	}

	setLoading() {
		if (this.loadByIntersecting) {
			this.createObserver();
		} else {
			if (!this.element.src) {
				this.element.src = this.element.getAttribute("data-src");
				this.element.onload = () => {
					this.element.classList.add("loaded");
				};
			}
		}
	}

	createObserver() {
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (!this.element.src) {
						this.element.src = this.element.getAttribute("data-src");
						this.element.onload = () => {
							this.element.classList.add("loaded");
						};
					}
				}
			});
		});
		this.observer.observe(this.element);
	}
}
