import { dirname, join } from "path";
import { fileURLToPath } from "url";

import webpack from "webpack";

import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const IS_DEVELOPMENT = process.env.NODE_ENV === "dev";
const __dirname = dirname(fileURLToPath(import.meta.url));

const dirApp = join(__dirname, "app");
const dirShared = join(__dirname, "shared");
const dirStyles = join(__dirname, "styles");
const dirNode = "node_modules";

const config = {
	entry: [join(dirApp, "index.js"), join(dirStyles, "index.sass")],
	resolve: {
		modules: [dirApp, dirShared, dirStyles, dirNode],
	},
	plugins: [
		new webpack.DefinePlugin({
			IS_DEVELOPMENT,
		}),

		new CopyWebpackPlugin({
			patterns: [
				{
					from: "./shared",
					to: "",
				},
			],
		}),

		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css",
		}),

		new ImageMinimizerPlugin({
			minimizerOptions: {
				plugins: [
					["gifsicle", { interlaced: true }],
					["jpegtran", { progressive: true }],
					["optipng", { optimizationLevel: 5 }],
				],
			},
		}),
		new CleanWebpackPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.sass$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: "",
						},
					},
					{ loader: "css-loader" },
					{ loader: "postcss-loader" },
					{ loader: "sass-loader" },
				],
			},
			{
				test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
				type: "asset/resource",
			},
			{
				test: /\.(glsl|frag|vert)$/,
				loader: "raw-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.(glsl|frag|vert)$/,
				loader: "glslify-loader",
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},
};

export default config;
