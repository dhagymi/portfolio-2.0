import express, { json, urlencoded } from "express";
import errorHandler from "errorhandler";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Prismic from "@prismicio/client";
import PrismicDOM from "prismic-dom";
import compression from "compression";
import UAParser from "ua-parser-js";

/* import router from "./routers/index.js"; */

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
let lang = "en";

/* Middlewares */

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(errorHandler());
app.use(compression());

/* Static path */

app.use(express.static(join(__dirname, "public")));

/* Router */

/* app.use("/api", router); */

const initApi = (req) => {
	return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
		accessToken: process.env.PRISMIC_ACCESS_TOKEN,
		req,
	});
};

const handleLinkResolver = (doc) => {
	if (doc.type === "about") {
		return "/about";
	}

	if (doc.type === "contact_page") {
		return "/contact";
	}

	if (doc.type === "works_page") {
		return "/works";
	}

	return "/";
};

app.use((req, res, next) => {
	const ua = UAParser(req.headers["user-agent"]);

	res.locals.isDesktop = ua.device.type === undefined;
	res.locals.isPhone = ua.device.type === "mobile";
	res.locals.isTablet = ua.device.type === "tablet";

	res.locals.lang = lang;

	res.locals.Link = handleLinkResolver;

	res.locals.PrismicDOM = PrismicDOM;

	next();
});

/* app.post("/", (req, res) => {
	try {
		const { body } = req;
		lang = body.lang;
		res.status("200").send(lang);
	} catch (error) {
		res.status("404").send({ error: error.message });
	}
}); */

app.set("views", join(__dirname, "views"));
app.set("view engine", "pug");

const handleRequest = async (api) => {
	const meta = await api.getSingle("meta");
	const header = await api.getSingle("header");
	const social = await api.getSingle("social");
	/* 	const preloader = await api.getSingle("preloader"); */

	console.log(meta.data);

	return {
		meta,
		header,
		social,
		/* 		preloader, */
	};
};

app.get("/", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const home = await api.getSingle("home");
	console.log(res.locals.lang);
	res.render("pages/home", {
		...defaults,
		home,
	});
});
app.get("/about", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	const about = await api.getSingle("about");

	res.render("pages/about", {
		...defaults,
		about,
	});
});

app.get("/contact", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const contact = await api.getSingle("contact_page");

	res.render("pages/contact", {
		...defaults,
		contact,
	});
});

app.get("/works", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const works = await api.getSingle("works_page");

	res.render("pages/works", {
		...defaults,
		works,
	});
});

/*

app.get("/*", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.status(404).render("pages/error", {
		...defaults,
	});
}); */

const server = app.listen(PORT, () =>
	console.log(`Serve on http://localhost:${PORT}`)
);
server.on("error", (error) => console.log(error));
