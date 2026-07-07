const MAX_PARTICLE_COUNT = 70;
const AREA_PER_PARTICLE = 16000;
const LINK_DISTANCE = 140;
const MAX_SPEED = 0.22;
const PARTICLE_COLOR = "62, 230, 255";
const MAX_DEVICE_PIXEL_RATIO = 1.5;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function particleCountFor(width, height) {
	return Math.min(MAX_PARTICLE_COUNT, Math.round((width * height) / AREA_PER_PARTICLE));
}

function createParticles(width, height) {
	return Array.from({ length: particleCountFor(width, height) }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		vx: (Math.random() - 0.5) * MAX_SPEED * 2,
		vy: (Math.random() - 0.5) * MAX_SPEED * 2,
		radius: 0.8 + Math.random() * 1.4,
	}));
}

export function initBackground(canvas) {
	const context = canvas.getContext("2d");
	let width = 0;
	let height = 0;
	let particles = [];
	let animationFrame = 0;

	function resize() {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		if (particles.length !== particleCountFor(width, height)) {
			particles = createParticles(width, height);
		}
	}

	function drawFrame() {
		context.clearRect(0, 0, width, height);

		for (const particle of particles) {
			particle.x += particle.vx;
			particle.y += particle.vy;
			if (particle.x < 0) particle.x += width;
			if (particle.x > width) particle.x -= width;
			if (particle.y < 0) particle.y += height;
			if (particle.y > height) particle.y -= height;
		}

		context.lineWidth = 1;
		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				const dx = particles[i].x - particles[j].x;
				const dy = particles[i].y - particles[j].y;
				const distance = Math.hypot(dx, dy);
				if (distance < LINK_DISTANCE) {
					const alpha = (1 - distance / LINK_DISTANCE) * 0.14;
					context.strokeStyle = `rgba(${PARTICLE_COLOR}, ${alpha.toFixed(3)})`;
					context.beginPath();
					context.moveTo(particles[i].x, particles[i].y);
					context.lineTo(particles[j].x, particles[j].y);
					context.stroke();
				}
			}
		}

		for (const particle of particles) {
			context.fillStyle = `rgba(${PARTICLE_COLOR}, 0.45)`;
			context.beginPath();
			context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			context.fill();
		}
	}

	function loop() {
		drawFrame();
		animationFrame = requestAnimationFrame(loop);
	}

	function start() {
		if (!animationFrame && !reducedMotion.matches) {
			animationFrame = requestAnimationFrame(loop);
		}
	}

	function stop() {
		cancelAnimationFrame(animationFrame);
		animationFrame = 0;
	}

	window.addEventListener("resize", () => {
		resize();
		if (reducedMotion.matches) {
			drawFrame();
		}
	});

	document.addEventListener("visibilitychange", () => {
		document.hidden ? stop() : start();
	});

	reducedMotion.addEventListener("change", () => {
		reducedMotion.matches ? stop() : start();
	});

	resize();
	drawFrame();
	start();
}
