class App {
	constructor() {
		this.scroll = 0;

		this.addEventListeners();
	}

	addEventListeners() {
		window.addEventListener("mousewheel", (event) => {
			this.scroll -= event.deltaY * 0.5;
			document.querySelector(
				".content"
			).style.transform = `translateY(${this.scroll}px)`;
		});
	}
}

new App();
