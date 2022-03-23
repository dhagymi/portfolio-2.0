const CACHE_NAME = "v1_cache_portfolio_dha";
const urlsToCache = [
	"./",
	"./icons/android-icon-36x36.png",
	"./icons/android-icon-48x48.png",
	"./icons/android-icon-72x72.png",
	"./icons/android-icon-96x96.png",
	"./icons/android-icon-144x144.png",
	"./icons/android-icon-192x192.png",
	"./main.js",
	"./main.css",
	"./icons/apple-icon-57x57.png",
	"./icons/apple-icon-60x60.png",
	"./icons/apple-icon-72x72.png",
	"./icons/apple-icon-76x76.png",
	"./icons/apple-icon-114x114.png",
	"./icons/apple-icon-120x120.png",
	"./icons/apple-icon-144x144.png",
	"./icons/apple-icon-152x152.png",
	"./icons/apple-icon-180x180.png",
	"./icons/favicon-32x32.png",
	"./icons/favicon-96x96.png",
	"./icons/favicon-16x16.png",
	"/f76cd5fb5dc0a18f6bde.woff2",
	"/2da609018c3e657466ef.woff2",
	"/1bd3bd8498d3f24fc6c4.woff2",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) =>
			cache
				.addAll(urlsToCache)
				.then(() => self.skipWaiting())
				.catch((error) => console.log(error))
		)
	);
});

self.addEventListener("activate", (event) => {
	const cacheWhiteList = [CACHE_NAME];

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheWhiteList.indexOf(cacheName) === -1) {
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				return response;
			} else {
				return fetch(event.request);
			}
		})
	);
});
