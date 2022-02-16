import { lerp, clamp } from "utils/math.js";
export default class Scroll {
	constructor({ ease, current = 0, target = 0, limit = 0, last = 0 }) {
		this.ease = ease;
		this.current = current;
		this.target = target;
		this.limit = limit;
		this.last = last;
	}

	interpolate() {
		this.target = clamp(0, this.limit, this.target);
		this.lerp = lerp(this.current, this.target, this.ease);
		if (this.lerp < 0.01) {
			this.current = 0;
		} else {
			this.current = this.lerp;
		}
	}
	updateParams({ ease, current, target, limit, last }) {
		this.ease = ease || this.ease;
		this.current = current || this.current;
		this.target = target || this.target;
		this.limit = limit || this.limit;
		this.last = last || this.last;
	}
}
