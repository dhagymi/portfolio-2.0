import { merge } from "webpack-merge";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import config from "./webpack.config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default merge(config, {
	mode: "development",
	devtool: "inline-source-map",
	devServer: {
		devMiddleware: {
			writeToDisk: true,
		},
	},
	output: {
		path: resolve(__dirname, "public"),
	},
});
