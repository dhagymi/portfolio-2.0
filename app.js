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
	/* 	if (doc.type === "concerts") {
		return "/concerts";
	}

	if (doc.type === "contact_page") {
		return "/contact";
	}

	if (doc.type === "music_page") {
		return "/music";
	}

	if (doc.type === "gallery") {
		return "/gallery";
	} */

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

const handleRequest = async ({ api, autoAdminApi }) => {
	/* 	const meta = await api.getSingle("meta");
	const header = await api.getSingle("header");
	const options = await api.getSingle("options");
	const preloader = await api.getSingle("preloader");
	const social = await api.getSingle("social");
	const footer = await api.getSingle("footer");

	const concertsList = await contactService.getConcerts(autoAdminApi, Prismic);

	return {
		meta,
		header,
		preloader,
		social,
		footer,
		options,
		concertsList,
	}; */
};

/* 
app.get("/", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });
	const home = await api.getSingle("home");

	home.data.spotify_link["target"] =
		home.data.spotify_link && home.data.spotify_link.target
			? home.data.spotify_link.target
			: "";

	res.render("pages/home", {
		...defaults,
		home,
	});
});
app.get("/concerts", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });

	const concerts = await api.getSingle("concerts");

	res.render("pages/concerts", {
		...defaults,
		concerts,
	});
});

app.get("/contact", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });
	const contact = await api.getSingle("contact_page");

	res.render("pages/contact", {
		...defaults,
		contact,
	});
});

app.get("/music", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });
	const music = await api.getSingle("music_page");
	music.data["album"] = music.data.album.map(({ album_image, album_link }) => {
		album_link["target"] =
			album_link && album_link.target ? album_link.target : "";
		return {
			image: album_image,
			link: album_link,
		};
	});
	music.data["videos"] = music.data.videos.map(
		({ video_image, video_link }) => {
			video_link["target"] =
				video_link && video_link.target ? video_link.target : "";
			return {
				image: video_image,
				link: video_link,
			};
		}
	);

	res.render("pages/music", {
		...defaults,
		music,
	});
});

app.get("/gallery", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });
	const gallery = await api.getSingle("gallery");
	const {
		data: { photo: galleryImages },
	} = await autoAdminApi.getSingle("gallery_image");
	const galleryData = [];

	for (let i = 0; i < galleryImages.length / 9; i++) {
		const gallerySet = [];
		for (let j = 0; j < 9; j++) {
			galleryImages[i * 9 + j] && gallerySet.push(galleryImages[i * 9 + j]);
		}
		galleryData.push(gallerySet);
	}

	res.render("pages/gallery", {
		...defaults,
		gallery,
		galleryData,
	});
});

app.get("/*", async (req, res) => {
	const api = await initApi(req);
	const autoAdminApi = await initAutoAdminApi(req);

	const defaults = await handleRequest({ api, autoAdminApi });

	res.status(404).render("pages/error", {
		...defaults,
	});
}); */

const server = app.listen(PORT, () =>
	console.log(`Serve on http://localhost:${PORT}`)
);
server.on("error", (error) => console.log(error));
