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
const availableLangs = ["en"];

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

const handleLinkResolver = (currentLang, doc) => {
	if (doc.type === "about") {
		return `/${currentLang}/about`;
	}

	if (doc.type === "contact_page") {
		return `/${currentLang}/contact`;
	}

	if (doc.type === "works_page") {
		return `/${currentLang}/works`;
	}

	return `/${currentLang}/`;
};

app.use((req, res, next) => {
	const ua = UAParser(req.headers["user-agent"]);

	res.locals.isDesktop = ua.device.type === undefined;
	res.locals.isPhone = ua.device.type === "mobile";
	res.locals.isTablet = ua.device.type === "tablet";

	res.locals.Link = handleLinkResolver;

	res.locals.availableLangs = availableLangs;

	res.locals.PrismicDOM = PrismicDOM;

	res.locals.pathname = req.path.slice(1);

	next();
});

app.set("views", join(__dirname, "views"));
app.set("view engine", "pug");

const handleRequest = async (api) => {
	const home = await api.getSingle("home");
	const error = await api.getSingle("error_page");
	const works = await api.getSingle("works_page");
	const contact = await api.getSingle("contact_page");
	const about = await api.getSingle("about");
	const meta = await api.getSingle("meta");
	const header = await api.getSingle("header");
	const navigation = header.data.body
		.filter((slice) => slice.slice_type === "navigation_item")
		.map(({ items, primary: { link } }) => {
			return {
				label: items,
				link,
			};
		});
	const languages = header.data.body
		.filter((slice) => slice.slice_type === "languages")
		.map(({ items, primary: { short_key, abbreviation } }) => {
			return {
				label: items,
				short_key,
				abbreviation,
			};
		});

	const {
		data: { social_network: social },
	} = await api.getSingle("social");

	const cards = about.data.body
		.filter((slice) => slice.slice_type === "card")
		.map(({ items: [text], primary: { name, image } }) => {
			return { text, name, image };
		});

	const { results: skillsResult } = await api.query(
		Prismic.Predicates.at("document.type", "skills")
	);

	const skills = skillsResult.map((result) => result.data);

	const { results: worksResult } = await api.query(
		Prismic.Predicates.at("document.type", "work")
	);

	works.data.items = worksResult.map((result) => result.data);

	const assets = [];

	assets.push(home.data.mica_card[0].image.url);
	assets.push(home.data.agus_card[0].image.url);

	cards.forEach((card) => {
		assets.push(card.image.url);
	});

	works.data.items.forEach((work) => {
		assets.push(work.image.url);
	});

	return {
		about,
		cards,
		contact,
		works,
		skills,
		meta,
		error,
		header,
		home,
		assets,
		social,
		navigation,
		languages,
		/* 		preloader, */
	};
};

router.get("/", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.render("pages/home", {
		...defaults,
	});
});
router.get("/about", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.render("pages/about", {
		...defaults,
	});
});

router.get("/contact", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.render("pages/contact", {
		...defaults,
	});
});

router.get("/works", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.render("pages/works", {
		...defaults,
	});
});

router.get("/*", async (req, res) => {
	const api = await initApi(req);

	const defaults = await handleRequest(api);

	res.status(404).render("pages/error", {
		...defaults,
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

app.get("/", (req, res) => {
	res.redirect("/en");
});

const server = app.listen(PORT, () =>
	console.log(`Serve on http://localhost:${PORT}`)
);
server.on("error", (error) => console.log(error));
