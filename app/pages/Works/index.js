import Page from "classes/Page.js";

export default class Works extends Page {
	constructor() {
		super({
			id: "works",
			element: ".works",
			elements: { wrapper: ".works__wrapper" },
			title: "Works",
		});
	}
}
