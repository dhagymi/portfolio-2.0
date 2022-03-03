import { each } from "lodash";

import LanguageDetection from "classes/LanguageDetection.js";

import About from "pages/About/index.js";
import Home from "pages/Home/index.js";
import Contact from "pages/Contact/index.js";
import Works from "pages/Works/index.js";
import ErrorPage from "pages/Error/index.js";

import Canvas from "components/Canvas/index.js";
import Cursor from "components/Cursor.js";
import Preloader from "components/Preloader.js";
import Options from "components/Options.js";
import Menu from "components/Menu.js";
import Arrow from "components/Arrow.js";
import ScrollBar from "components/ScrollBar.js";

class App {
	constructor() {
		this.createLang();
		this.createContent();

		this.createGeneralCanvas();
		this.createCanvas();
		this.createCursor();
		this.createPreloader();
		this.createMenu();
		this.createOptions();
		this.createArrow();
		this.createPages();
		this.createScrollBar();
		this.createTitle();

		this.addEventListeners();
		this.addLinkListeners();

		this.update();

		console.log(
			`%cDeveloped & Designed by DHÁTeam ${String.fromCodePoint(0x0270c)}`,
			"color: #EE4801; background: #1A1A1A; padding: 5px 10px; border-radius: 3px; font-family: 'Verdana'; font-weight: 600"
		);
	}

	/* Creates */

	createLang() {
		this.lang = LanguageDetection.detectLanguage();
	}

	createGeneralCanvas() {
		this.generalCanvas = new Canvas({
			general: true,
		});
	}

	createCanvas() {
		this.canvas = new Canvas({
			template: this.template,
		});
	}

	createCursor() {
		this.cursor = new Cursor();
		this.cursor.create();
	}

	createPreloader() {
		this.preloader = new Preloader({
			canvas: this.canvas,
		});
		this.preloader.once("completed", this.onPreloaded.bind(this));
	}

	createMenu() {
		this.menu = new Menu({
			template: this.template,
		});
	}

	createScrollBar() {
		this.scrollBar = new ScrollBar({
			updateScroll: this.updateScroll.bind(this),
		});
		this.scrollBar.create();
	}

	createOptions() {
		this.options = new Options({
			template: this.template,
			interactionComponents: { menu: this.menu },
		});
		this.options.create();
	}

	createArrow() {
		this.arrow = new Arrow({ template: this.template });
		this.arrow.create();
	}

	createContent() {
		this.content = document.querySelector(".content");
		this.template = this.content.getAttribute("data-template");
	}

	createPages() {
		this.pages = {
			home: new Home(),
			about: new About(),
			works: new Works(),
			contact: new Contact(),
			error: new ErrorPage(),
		};

		this.page = this.pages[this.template];

		this.page.create();
	}

	createTitle() {
		this.title = document.querySelector("title");
		this.title.innerText = `DHÁ Team  |  ${this.page.title[this.lang]}`;
	}

	/* Links */

	addLinkListeners() {
		this.links = document.querySelectorAll("a");
		this.boundedLinkCallback = this.linkListenersCallback.bind(this);

		each(this.links, (link) => {
			link.addEventListener("click", this.boundedLinkCallback);
		});
	}

	removeLinkListeners() {
		each(this.links, (link) => {
			link.removeEventListener("click", this.boundedLinkCallback);
		});
	}

	linkListenersCallback(event) {
		let link;
		if (!(event.target instanceof window.HTMLAnchorElement)) {
			link = event.target.parentNode;
			while (!(link instanceof window.HTMLAnchorElement)) {
				link = link.parentNode;
			}
		} else {
			link = event.target;
		}

		const { href: url } = link;
		const location = url.split("/")[url.split("/").length - 1];
		const language = window.location.pathname.split("/")[1];

		if (
			url.includes(window.location.origin) &&
			(!(link.children[0].dataset?.language || link.dataset?.language) ||
				language === link.children[0].dataset.language ||
				language === link.dataset?.language)
		) {
			event.preventDefault();
		}

		if (
			location !== this.template &&
			!(location.trim() === "" && this.template === "home")
		) {
			if (url.includes(window.location.origin)) {
				this.onChange({ url });
			}
		}
	}

	/* Loop */
	update(time) {
		if (this.page && this.page.update) {
			this.page.update();
		}

		if (this.options && this.options.update) {
			this.options.update(this.page.showed || false);
		}

		if (this.scrollBar && this.scrollBar.update) {
			this.scrollBar.update(this.page.showed || false);
		}

		if (this.arrow && this.arrow.update) {
			this.arrow.update(this.page.showed || false, this.page.scroll);
		}

		if (this.cursor && this.cursor.update) {
			this.cursor.update(true);
		}

		if (this.canvas && this.canvas.update) {
			this.canvas.update(this.page.scroll, time);
		}

		if (this.generalCanvas && this.generalCanvas.update) {
			this.generalCanvas.update(null, time);
		}

		this.frame = window.requestAnimationFrame(this.update.bind(this));
	}

	updateScroll({ ease, current, target, limit, last }) {
		this.page.updateScroll({ ease, current, target, limit, last });
		this.scrollBar.updateScroll({ ease, current, target, limit, last });
	}

	/* Events */
	async onChange({ url, push = true }) {
		this.removeLinkListeners();

		this.arrow.hide();
		this.menu.desactivate();
		this.options.desactivate();
		this.canvas.onChangeStart();
		this.page.hide();

		const request = await fetch(url);

		if (request.status === 200) {
			const html = await request.text();
			const div = document.createElement("div");
			if (push) {
				window.history.pushState({}, "", url);
			}

			div.innerHTML = html;

			const divContent = div.querySelector(".content");

			this.template = divContent.getAttribute("data-template");

			this.menu.onChange(this.template);
			this.options.onChange(this.template);

			this.content.setAttribute("data-template", this.template);
			this.content.innerHTML = divContent.innerHTML;
			this.canvas.onChange(this.template);

			this.page = this.pages[this.template];
			this.page.create();
			this.createTitle();

			this.onResize();

			this.scrollBar.onChange();

			this.page.show();

			this.addLinkListeners();
		} else {
			console.log("Error");
		}
	}

	onPopState() {
		this.onChange({ url: window.location.pathname, push: false });
	}

	onPreloaded() {
		this.preloader.destroy();

		this.canvas.onPreloaded();
		this.generalCanvas.onPreloaded();

		this.onResize();

		this.page.show();
		this.arrow.specialAddEventListeners();
	}

	onResize() {
		if (this.page && this.page.onResize) {
			this.page.onResize();
			if (this.options?.onResize) {
				this.options.onResize(this.page.elements.wrapper);
			}
			if (this.scrollBar?.onResize) {
				this.scrollBar.onResize(this.page.elements.wrapper);
			}
			if (this.arrow?.onResize) {
				this.arrow.onResize(this.page.elements.wrapper);
			}
			window.requestAnimationFrame((_) => {
				if (this.generalCanvas && this.generalCanvas.onResize) {
					this.generalCanvas.onResize();
				}
			});

			window.requestAnimationFrame((_) => {
				if (this.canvas && this.canvas.onResize) {
					this.canvas.onResize();
				}
			});
		}
	}

	/* Listeners */

	addEventListeners() {
		window.addEventListener("popstate", this.onPopState.bind(this));
		window.addEventListener("resize", this.onResize.bind(this));
	}
}

new App();
