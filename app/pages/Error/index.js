import Page from "classes/Page.js";

export default class ErrorPage extends Page {
	constructor() {
		super({
			id: "error",
			element: ".error",
			elements: { wrapper: ".error__wrapper" },
			title: { en: "Page not found", es: "Página no encontrada" },
		});
	}
}
