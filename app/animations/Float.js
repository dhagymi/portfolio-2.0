import GSAP from "gsap";
import prefix from "prefix";

import Animation from "classes/Animation.js";

export default class Float extends Animation {
	constructor({ element, elements, options }) {
		super({ element, elements });

		this.maxDeltaDegAngularAccForCs =
			options?.maxDeltaDegAngularAccForCs || 0.002;
		this.maxDeltaPorcLinearAccForCs =
			options?.maxDeltaPorcLinearAccForCs || 0.002;
		this.maxDeltaDegAngularVelForCs =
			options?.maxDeltaDegAngularVelForCs || 0.2;
		this.maxDeltaPorcLinearVelForCs =
			options?.maxDeltaPorcLinearVelForCs || 0.2;
		this.maxDeltaDegAngularPos = options?.maxDeltaDegAngularPos || 25;
		this.maxDeltaPorcLinearPos = options?.maxDeltaPorcLinearPos || 20;
		this.deltaTimeMs = options?.deltaTimeMs || 4000;
		this.movementUpdateTimeInMs = options?.movementUpdateTimeInMs || 10;
		this.expCoeficient = options?.expCoeficient || 2;
		this.angularAccelerationInitial = options?.angularAccelerationInitial || 0;
		this.linearAccelerationYInitial = options?.linearAccelerationYInitial || 0;
		this.linearAccelerationXInitial = options?.linearAccelerationXInitial || 0;
		this.angularVelocityInitial = options?.angularVelocityInitial || 0;
		this.linearVelocityYInitial = options?.linearVelocityYInitial || 0;
		this.linearVelocityXInitial = options?.linearVelocityXInitial || 0;
		this.angularPositionInitial = options?.angularPositionInitial || 0;
		this.linearPositionYInitial = options?.linearPositionYInitial || 0;
		this.linearPositionXInitial = options?.linearPositionXInitial || 0;

		this.angularAcceleration =
			this.angularAccelerationInitial >= this.maxDeltaDegAngularAccForCs
				? 0
				: this.angularAccelerationInitial;

		this.linearAccelerationY =
			this.linearAccelerationYInitial >= this.maxDeltaPorcLinearAccForCs
				? 0
				: this.linearAccelerationYInitial;

		this.linearAccelerationX =
			this.linearAccelerationXInitial >= this.maxDeltaPorcLinearAccForCs
				? 0
				: this.linearAccelerationXInitial;

		this.angularVelocity = this.angularVelocityInitial;

		this.linearVelocityY = this.linearVelocityYInitial;

		this.linearVelocityX = this.linearVelocityXInitial;

		this.angularPosition = this.angularPositionInitial;

		this.linearPositionY = this.linearPositionYInitial;

		this.linearPositionX = this.linearPositionXInitial;

		this.flagAngular = 1;
		this.flagLinearY = 1;
		this.flagLinearX = 1;

		this.transformPrefix = prefix("transform");

		this.setAcceleration();
		this.changeDirection();
		this.setConstraints();
	}

	createObserver() {}

	animateIn() {}

	animateOut() {}

	changeDirection() {
		setInterval(() => {
			this.flagAngular = -this.flagAngular;
			this.flagLinearY = -this.flagLinearY;
			this.flagLinearX = -this.flagLinearX;
		}, ((Math.random() + 1) * this.deltaTimeMs) / 2);
	}

	setAcceleration() {
		this.angularAcceleration =
			Math.random() ** this.expCoeficient *
			this.maxDeltaDegAngularAccForCs *
			this.flagAngular;
		this.linearAccelerationY =
			Math.random() ** this.expCoeficient *
			this.maxDeltaPorcLinearAccForCs *
			this.flagLinearY;
		this.linearAccelerationX =
			Math.random() ** this.expCoeficient *
			this.maxDeltaPorcLinearAccForCs *
			this.flagLinearX;
	}

	setConstraints() {
		setInterval(() => {
			if (
				Math.abs(
					this.angularVelocity +
						this.angularAcceleration -
						this.angularVelocityInitial
				) >= this.maxDeltaDegAngularVelForCs
			) {
				this.angularVelocity = this.angularVelocity - this.angularAcceleration;
				this.angularAcceleration = 0;
				this.flagAngular = -this.flagAngular;
			} else {
				this.angularVelocity = this.angularVelocity + this.angularAcceleration;
			}

			if (
				Math.abs(
					this.linearVelocityY +
						this.linearAccelerationY -
						this.linearVelocityYInitial
				) >= this.maxDeltaPorcLinearVelForCs
			) {
				this.linearVelocityY = this.linearVelocityY - this.linearAccelerationY;
				this.linearAccelerationY = 0;
				this.flagLinearY = -this.flagLinearY;
			} else {
				this.linearVelocityY = this.linearVelocityY + this.linearAccelerationY;
			}
			if (
				Math.abs(
					this.linearVelocityX +
						this.linearAccelerationX -
						this.linearVelocityXInitial
				) >= this.maxDeltaPorcLinearVelForCs
			) {
				this.linearVelocityX = this.linearVelocityX - this.linearAccelerationX;
				this.linearAccelerationX = 0;
				this.flagLinearX = -this.flagLinearX;
			} else {
				this.linearVelocityX = this.linearVelocityX + this.linearAccelerationX;
			}
			if (
				Math.abs(
					this.angularPosition +
						this.angularVelocity -
						this.angularPositionInitial
				) >= this.maxDeltaDegAngularPos
			) {
				this.angularPosition = this.angularPosition - this.angularVelocity;
				this.angularVelocity = 0;
				this.flagAngular = -this.flagAngular;
			} else {
				this.angularPosition = this.angularPosition + this.angularVelocity;
			}
			if (
				Math.abs(
					this.linearPositionY +
						this.linearVelocityY -
						this.linearPositionYInitial
				) >= this.maxDeltaPorcLinearPos
			) {
				this.linearPositionY = this.linearPositionY - this.linearVelocityY;
				this.linearVelocityY = 0;
				this.flagLinearY = -this.flagLinearY;
			} else {
				this.linearPositionY = this.linearPositionY + this.linearVelocityY;
			}
			if (
				Math.abs(
					this.linearPositionX +
						this.linearVelocityX -
						this.linearPositionXInitial
				) >= this.maxDeltaPorcLinearPos
			) {
				this.linearPositionX = this.linearPositionX - this.linearVelocityX;
				this.linearVelocityX = 0;
				this.flagLinearX = -this.flagLinearX;
			} else {
				this.linearPositionX = this.linearPositionX + this.linearVelocityX;
			}
		}, this.movementUpdateTimeInMs);
	}

	update() {
		this.setAcceleration();

		this.element.style[
			this.transformPrefix
		] = `translateX(${this.linearPositionX}%) rotate(${this.angularPosition}deg) translateY(${this.linearPositionY}%)`;
	}
}
