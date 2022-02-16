import Page from "classes/Page.js";

export default class Contact extends Page {
	constructor() {
		super({
			id: "contact",
			element: ".contact",
			elements: {
				wrapper: ".contact__wrapper",
				button: ".contact__body__button",
			},
			title: "",
		});
	}
}
