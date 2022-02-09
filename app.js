import express, { json, urlencoded, Router } from "express";
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
const router = new Router();
const availableLangs = ["en", "es"];

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

	res.locals.Link = handleLinkResolver;

	res.locals.PrismicDOM = PrismicDOM;

	next();
});

app.set("views", join(__dirname, "views"));
app.set("view engine", "pug");

const handleRequest = async (api) => {
	const meta = await api.getSingle("meta");
	const header = await api.getSingle("header");
	const social = await api.getSingle("social");
	/* 	const preloader = await api.getSingle("preloader"); */

	return {
		meta,
		header,
		social,
		/* 		preloader, */
	};
};

router.get("/", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const home = await api.getSingle("home");

	res.render("pages/home", {
		...defaults,
		home,
	});
});
router.get("/about", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const about = await api.getSingle("about");

	const cards = about.data.body
		.filter((slice) => slice.slice_type === "card")
		.map(({ items: [text], primary: { name, image } }) => {
			return { text, name, image };
		});

	const { results } = await api.query(
		Prismic.Predicates.at("document.type", "skills")
	);

	const skills = results.map((result) => result.data);

	res.render("pages/about", {
		...defaults,
		about,
		cards,
		skills,
	});
});

router.get("/contact", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const contact = await api.getSingle("contact_page");

	console.log(contact.data);

	res.render("pages/contact", {
		...defaults,
		contact,
	});
});

router.get("/works", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const works = await api.getSingle("works_page");

	const { results } = await api.query(
		Prismic.Predicates.at("document.type", "work")
	);

	works.data.items = results.map((result) => result.data);

	res.render("pages/works", {
		...defaults,
		works,
	});
});

router.get("/*", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);
	const error = await api.getSingle("error_page");

	res.status(404).render("pages/error", {
		...defaults,
		error,
	});
});

app.use(
	"/:lang",
	(req, res, next) => {
		if (availableLangs.includes(req.params.lang)) {
			res.locals.lang = req.params.lang;
			next();
		} else {
			res.redirect("/en/error");
		}
	},
	router
);

const server = app.listen(PORT, () =>
	console.log(`Serve on http://localhost:${PORT}`)
);
server.on("error", (error) => console.log(error));
