import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const FBXModelViewer = () => {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#2f3640");

		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		// Lights
		scene.add(new THREE.AmbientLight(0xffffff, 1));
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 5, 5);
		scene.add(directionalLight);

		// Baseline grid helper
		// const gridHelper = new THREE.GridHelper(200, 50);
		// scene.add(gridHelper);

		// Load FBX model
		const loader = new FBXLoader();
		loader.load(
			"/YBot.fbx",
			(object) => {
				scene.add(object);

				// Compute bounding box of the model
				const box = new THREE.Box3().setFromObject(object);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);

				// Calculate distance so that the model fits in view
				const fov = camera.fov * (Math.PI / 180);
				let distance = Math.abs(maxDim / 2 / Math.tan(fov / 2));
				distance *= 1.5; // add margin

				// Position the camera directly in front of the model's center
				camera.position.set(center.x, center.y, center.z + distance);
				camera.near = distance / 100;
				camera.far = distance * 100;
				camera.updateProjectionMatrix();

				// Set controls to look at the center of the model
				controls.target.copy(center);
			},
			undefined,
			(error) => console.error("Error loading FBX model:", error)
		);

		const animate = () => {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};
		animate();

		const handleResize = () => {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			container.removeChild(renderer.domElement);
			renderer.dispose();
		};
	}, []);

	return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default FBXModelViewer;
