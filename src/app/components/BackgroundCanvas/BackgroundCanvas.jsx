import React, { useRef, useEffect } from "react";

const BackgroundCanvas = () => {
	const canvasRef = useRef(null);
	const focalLength = 400;

	// 3D perspective projection
	const project = (x, y, z, canvasWidth, canvasHeight) => {
		const scale = focalLength / (focalLength + z);
		return {
			x: x * scale + canvasWidth / 2,
			y: y * scale + canvasHeight / 2,
		};
	};

	// Rotate a 3D point around X, Y, Z axes
	const rotate3D = (p, rx, ry, rz) => {
		let { x, y, z } = p;
		let cos = Math.cos(rx),
			sin = Math.sin(rx);
		let y1 = y * cos - z * sin,
			z1 = y * sin + z * cos;
		y = y1;
		z = z1;
		cos = Math.cos(ry);
		sin = Math.sin(ry);
		let x1 = x * cos + z * sin,
			z2 = -x * sin + z * cos;
		x = x1;
		z = z2;
		cos = Math.cos(rz);
		sin = Math.sin(rz);
		return { x: x * cos - y * sin, y: x * sin + y * cos, z };
	};

	// Draw a wireframe sphere with latitude and longitude lines
	const drawWireSphere = (
		ctx,
		center,
		radius,
		rotation,
		canvasWidth,
		canvasHeight
	) => {
		ctx.strokeStyle = "rgba(255,255,255,0.8)";
		const segments = 30,
			latLines = 6,
			longLines = 6;
		// Latitude circles
		for (let i = 1; i < latLines; i++) {
			const v = -Math.PI / 2 + (i / latLines) * Math.PI;
			ctx.beginPath();
			for (let j = 0; j <= segments; j++) {
				const u = (j / segments) * 2 * Math.PI;
				let x = radius * Math.cos(v) * Math.cos(u);
				let y = radius * Math.cos(v) * Math.sin(u);
				let z = radius * Math.sin(v);
				let p = rotate3D({ x, y, z }, rotation.x, rotation.y, rotation.z);
				p.x += center.x;
				p.y += center.y;
				p.z += center.z;
				const proj = project(p.x, p.y, p.z, canvasWidth, canvasHeight);
				j === 0 ? ctx.moveTo(proj.x, proj.y) : ctx.lineTo(proj.x, proj.y);
			}
			ctx.stroke();
		}
		// Longitude circles
		for (let j = 0; j < longLines; j++) {
			const u = (j / longLines) * 2 * Math.PI;
			ctx.beginPath();
			for (let i = 0; i <= segments; i++) {
				const v = -Math.PI / 2 + (i / segments) * Math.PI;
				let x = radius * Math.cos(v) * Math.cos(u);
				let y = radius * Math.cos(v) * Math.sin(u);
				let z = radius * Math.sin(v);
				let p = rotate3D({ x, y, z }, rotation.x, rotation.y, rotation.z);
				p.x += center.x;
				p.y += center.y;
				p.z += center.z;
				const proj = project(p.x, p.y, p.z, canvasWidth, canvasHeight);
				i === 0 ? ctx.moveTo(proj.x, proj.y) : ctx.lineTo(proj.x, proj.y);
			}
			ctx.stroke();
		}
	};

	// Draw a wireframe cube
	const drawWireCube = (
		ctx,
		center,
		size,
		rotation,
		canvasWidth,
		canvasHeight
	) => {
		const half = size / 2;
		const vertices = [
			{ x: -half, y: -half, z: -half },
			{ x: half, y: -half, z: -half },
			{ x: half, y: half, z: -half },
			{ x: -half, y: half, z: -half },
			{ x: -half, y: -half, z: half },
			{ x: half, y: -half, z: half },
			{ x: half, y: half, z: half },
			{ x: -half, y: half, z: half },
		];
		const edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
		];
		const transformed = vertices.map((v) => {
			const r = rotate3D(v, rotation.x, rotation.y, rotation.z);
			return { x: r.x + center.x, y: r.y + center.y, z: r.z + center.z };
		});
		const projected = transformed.map((v) =>
			project(v.x, v.y, v.z, canvasWidth, canvasHeight)
		);
		ctx.strokeStyle = "rgba(255,255,255,0.8)";
		ctx.beginPath();
		edges.forEach(([i, j]) => {
			const p1 = projected[i],
				p2 = projected[j];
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
		});
		ctx.stroke();
	};

	// Draw a wireframe pyramid with a square base
	const drawWirePyramid = (
		ctx,
		center,
		baseSize,
		pyramidHeight,
		rotation,
		canvasWidth,
		canvasHeight
	) => {
		const half = baseSize / 2;
		const vertices = [
			{ x: -half, y: -half, z: 0 }, // base bottom-left
			{ x: half, y: -half, z: 0 }, // base bottom-right
			{ x: half, y: half, z: 0 }, // base top-right
			{ x: -half, y: half, z: 0 }, // base top-left
			{ x: 0, y: 0, z: -pyramidHeight }, // apex
		];
		const edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 4],
			[1, 4],
			[2, 4],
			[3, 4],
		];
		const transformed = vertices.map((v) => {
			const r = rotate3D(v, rotation.x, rotation.y, rotation.z);
			return { x: r.x + center.x, y: r.y + center.y, z: r.z + center.z };
		});
		const projected = transformed.map((v) =>
			project(v.x, v.y, v.z, canvasWidth, canvasHeight)
		);
		ctx.strokeStyle = "rgba(255,255,255,0.8)";
		ctx.beginPath();
		edges.forEach(([i, j]) => {
			const p1 = projected[i],
				p2 = projected[j];
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
		});
		ctx.stroke();
	};

	// Draw an animated landscape using a grid mesh
	const drawLandscape = (ctx, t, canvasWidth, canvasHeight) => {
		ctx.strokeStyle = "rgba(255,255,255,0.3)";
		const gridSpacing = 30;
		const xStart = -300,
			xEnd = 300;
		const zStart = 50,
			zEnd = 600;
		const amplitude = 20,
			frequency = 0.02;
		const tiltX = -0.7;
		const grid = [];
		for (let z = zStart; z <= zEnd; z += gridSpacing) {
			const row = [];
			for (let x = xStart; x <= xEnd; x += gridSpacing) {
				let y =
					amplitude * Math.sin(frequency * x + t) * Math.cos(frequency * z + t);
				let p = rotate3D({ x, y, z }, tiltX, 0, 0);
				row.push(project(p.x, p.y, p.z, canvasWidth, canvasHeight));
			}
			grid.push(row);
		}
		grid.forEach((row) => {
			ctx.beginPath();
			row.forEach((pt, idx) => {
				idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
			});
			ctx.stroke();
		});
		const cols = grid[0]?.length || 0;
		for (let col = 0; col < cols; col++) {
			ctx.beginPath();
			for (let row = 0; row < grid.length; row++) {
				const pt = grid[row][col];
				row === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
			}
			ctx.stroke();
		}
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		let canvasWidth = (canvas.width = window.innerWidth);
		let canvasHeight = (canvas.height = window.innerHeight);

		// Group offset to position all shapes in one corner (bottom‑right)
		// Adjust these values as needed to suit your screen size.
		const groupOffset = { x: 600, y: 300, z: 300 };

		// Define individual rotations and speeds
		let sphereRotation = { x: 0, y: 0, z: 0 };
		const sphereSpeed = { x: 0.01, y: 0.015, z: 0.005 };

		let cubeRotation = { x: 0, y: 0, z: 0 };
		const cubeSpeed = { x: 0.012, y: 0.01, z: 0.008 };

		let pyramidRotation = { x: 0, y: 0, z: 0 };
		const pyramidSpeed = { x: 0.008, y: 0.012, z: 0.01 };

		const startTime = Date.now();
		let animationFrameId;

		const render = () => {
			const t = (Date.now() - startTime) * 0.002;
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);

			// Draw animated landscape in the background
			drawLandscape(ctx, t, canvasWidth, canvasHeight);

			// Update rotations
			sphereRotation.x += sphereSpeed.x;
			sphereRotation.y += sphereSpeed.y;
			sphereRotation.z += sphereSpeed.z;

			cubeRotation.x += cubeSpeed.x;
			cubeRotation.y += cubeSpeed.y;
			cubeRotation.z += cubeSpeed.z;

			pyramidRotation.x += pyramidSpeed.x;
			pyramidRotation.y += pyramidSpeed.y;
			pyramidRotation.z += pyramidSpeed.z;

			// Position shapes relative to the group offset
			const sphereCenter = {
				x: groupOffset.x,
				y: groupOffset.y,
				z: groupOffset.z,
			};
			const cubeCenter = {
				x: groupOffset.x - 120,
				y: groupOffset.y,
				z: groupOffset.z,
			};
			const pyramidCenter = {
				x: groupOffset.x + 250,
				y: groupOffset.y,
				z: groupOffset.z,
			};

			// Draw the three wireframe shapes
			drawWireSphere(
				ctx,
				sphereCenter,
				50,
				sphereRotation,
				canvasWidth,
				canvasHeight
			);
			drawWireCube(
				ctx,
				cubeCenter,
				80,
				cubeRotation,
				canvasWidth,
				canvasHeight
			);
			drawWirePyramid(
				ctx,
				pyramidCenter,
				80,
				60,
				pyramidRotation,
				canvasWidth,
				100
			);

			animationFrameId = requestAnimationFrame(render);
		};
		render();

		const handleResize = () => {
			canvasWidth = canvas.width = window.innerWidth;
			canvasHeight = canvas.height = window.innerHeight;
		};
		window.addEventListener("resize", handleResize);
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				zIndex: 1,
				background: "#000",
				width: "100%",
			}}
		/>
	);
};

export default BackgroundCanvas;
