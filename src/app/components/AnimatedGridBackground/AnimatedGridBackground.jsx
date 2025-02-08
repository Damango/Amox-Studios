import React, { useEffect, useRef } from "react";
import styles from "../../page.module.css";

export default function AnimatedGridBackground() {
	const canvasRef = useRef(null);
	const requestRef = useRef(null);

	useEffect(() => {
		// Grab the canvas
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		// Resize function
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener("resize", resizeCanvas);
		resizeCanvas();

		// Configuration
		const spacing = 50; // distance between grid lines
		const lineSpeed = 150; // px/second
		const numLines = 3; // how many lines animate at once
		const dotCount = 3; // how many dots each line visits in sequence
		const waitAfterFinish = 1000; // ms: how long to wait/fade after finishing before a new line
		const fadeDuration = waitAfterFinish; // fade from alpha=1 to 0

		// Data structures for lines
		const lines = [];
		let prevTime = performance.now();

		// Helper: Manhattan distance
		function manhattanDistance(a, b) {
			return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
		}

		// Return a random grid-aligned point
		function getRandomGridPoint() {
			const xCount = Math.floor(canvas.width / spacing);
			const yCount = Math.floor(canvas.height / spacing);
			return {
				x: Math.floor(Math.random() * xCount) * spacing,
				y: Math.floor(Math.random() * yCount) * spacing,
			};
		}

		// Build a random path along the grid from start to end without crossing itself.
		// Simple random walk that biases moves toward the destination.
		// If stuck, we snap to the end.
		function buildNonCrossingRandomPath(start, end) {
			const path = [start];
			const visited = new Set([`${start.x},${start.y}`]);
			let current = { x: start.x, y: start.y };
			const maxSteps = 5000; // safety guard
			let steps = 0;

			while (current.x !== end.x || current.y !== end.y) {
				steps++;
				if (steps > maxSteps) {
					// fallback to forcibly end
					path.push(end);
					return path;
				}

				// Potential moves: up, down, left, right
				const potentialMoves = [];
				if (current.y - spacing >= 0) {
					potentialMoves.push({ x: current.x, y: current.y - spacing });
				}
				if (current.y + spacing <= canvas.height) {
					potentialMoves.push({ x: current.x, y: current.y + spacing });
				}
				if (current.x - spacing >= 0) {
					potentialMoves.push({ x: current.x - spacing, y: current.y });
				}
				if (current.x + spacing <= canvas.width) {
					potentialMoves.push({ x: current.x + spacing, y: current.y });
				}

				// Exclude already visited squares
				const validMoves = potentialMoves.filter(
					(m) => !visited.has(`${m.x},${m.y}`)
				);
				if (validMoves.length === 0) {
					// stuck, end forcibly
					path.push(end);
					return path;
				}

				// Moves that reduce or maintain distance to end
				let bestDist = manhattanDistance(current, end);
				const closerMoves = [];
				validMoves.forEach((m) => {
					const d = manhattanDistance(m, end);
					if (d <= bestDist) {
						closerMoves.push(m);
					}
				});

				let chosen;
				if (closerMoves.length > 0) {
					chosen = closerMoves[Math.floor(Math.random() * closerMoves.length)];
				} else {
					chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
				}

				path.push(chosen);
				visited.add(`${chosen.x},${chosen.y}`);
				current = chosen;
			}
			return path;
		}

		// Convert a list of points into segment objects { start, end, dx, dy, length }
		function buildSegmentsFromPoints(points) {
			const segments = [];
			for (let i = 0; i < points.length - 1; i++) {
				const start = points[i];
				const end = points[i + 1];
				const dx = end.x - start.x;
				const dy = end.y - start.y;
				const length = Math.sqrt(dx * dx + dy * dy);
				segments.push({ start, end, dx, dy, length });
			}
			return segments;
		}

		// Create multiple random dots for the line to visit in sequence
		function getRandomTargetPoints(count) {
			const targets = [];
			for (let i = 0; i < count; i++) {
				targets.push(getRandomGridPoint());
			}
			return targets;
		}

		// Create a new line object that visits multiple random dots with random non-crossing paths.
		function createNewLine() {
			const origin = getRandomGridPoint();
			const dotTargets = getRandomTargetPoints(dotCount);

			let fullPath = [origin];
			let current = origin;

			dotTargets.forEach((dot) => {
				const partialPath = buildNonCrossingRandomPath(current, dot);
				// skip repeating the first point in partial
				partialPath.shift();
				fullPath = fullPath.concat(partialPath);
				current = dot;
			});

			const segments = buildSegmentsFromPoints(fullPath);

			return {
				dotTargets,
				segments,
				currentSegmentIdx: 0,
				distanceOnSegment: 0,
				finished: false,
				finishTime: 0,
				alpha: 1, // for fade-out
			};
		}

		// Initialize line objects
		for (let i = 0; i < numLines; i++) {
			lines.push(createNewLine());
		}

		// The main animation loop
		const animate = (timestamp) => {
			const dt = (timestamp - prevTime) / 1000; // in seconds
			prevTime = timestamp;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Animate each line
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				// If finished, fade out
				if (line.finished) {
					const fadeElapsed = timestamp - line.finishTime;
					const fadeFraction = fadeElapsed / fadeDuration;
					line.alpha = Math.max(0, 1 - fadeFraction);
					if (line.alpha <= 0) {
						// completely faded out -> create new line
						lines[i] = createNewLine();
						continue;
					} else {
						drawLine(line);
					}
				} else {
					// Move along the current segment
					let seg = line.segments[line.currentSegmentIdx];
					line.distanceOnSegment += lineSpeed * dt;

					// If we exceeded the current segment length, move to the next
					while (seg && line.distanceOnSegment >= seg.length) {
						line.distanceOnSegment -= seg.length;
						line.currentSegmentIdx++;
						seg = line.segments[line.currentSegmentIdx];
					}

					if (!seg) {
						// no more segments => done, start fade out
						line.finished = true;
						line.finishTime = timestamp;
						line.alpha = 1;
						drawLine(line);
					} else {
						drawLine(line);
					}
				}
			}

			requestRef.current = requestAnimationFrame(animate);
		};

		function drawLine(line) {
			const { segments, currentSegmentIdx, distanceOnSegment, dotTargets } =
				line;
			if (segments.length === 0) return;

			// set global alpha for fade out
			ctx.save();
			ctx.globalAlpha = line.alpha;

			// draw the target dots
			dotTargets.forEach((dot) => {
				ctx.beginPath();
				ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
				ctx.fillStyle = "#fff";
				ctx.fill();
			});

			// draw path (all completed segments + partial)
			ctx.beginPath();
			ctx.moveTo(segments[0].start.x, segments[0].start.y);

			// Completed segments
			for (let s = 0; s < currentSegmentIdx; s++) {
				ctx.lineTo(segments[s].end.x, segments[s].end.y);
			}

			// Partial segment
			if (currentSegmentIdx < segments.length) {
				const seg = segments[currentSegmentIdx];
				const fraction = seg.length > 0 ? distanceOnSegment / seg.length : 0;
				const cx = seg.start.x + seg.dx * fraction;
				const cy = seg.start.y + seg.dy * fraction;
				ctx.lineTo(cx, cy);
			}

			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
		}

		requestRef.current = requestAnimationFrame(animate);

		// Cleanup on unmount
		return () => {
			window.removeEventListener("resize", resizeCanvas);
			cancelAnimationFrame(requestRef.current);
		};
	}, []);

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				background:
					"linear-gradient(to right, #444 1px, transparent 1px) 0 0,\n           linear-gradient(to bottom, #444 1px, transparent 1px) 0 0",
				backgroundSize: "50px 50px",
				backgroundColor: "#000",
				overflow: "hidden",
			}}
			className={styles.scene}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}
