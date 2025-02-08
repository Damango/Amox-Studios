import React, { lazy, Suspense } from "react";
import styles from "./GameExamples.module.css";
import BackgroundCanvas from "../BackgroundCanvas/BackgroundCanvas";
// import ModelViewer from "../ModelViewer/ModelViewer";
import { motion } from "motion/react";
import { useInView } from "motion/react";
const GameExamples = (props) => {
	const gamesList = [
		{ title: "Unturned", img: "" },
		{ title: "Minecraft", img: "" },
		{ title: "GTA V", img: "" },
		{ title: "Rust", img: "" },
	];

	const ModelViewer = lazy(() => import("../ModelViewer/ModelViewer"));
	const ref = React.useRef(null);
	const isInView = useInView(ref, { once: true });

	return (
		<div className={styles.gameExamplesWrapper}>
			<BackgroundCanvas />
			<div className={styles.gameExamplesContainer}>
				<div className={styles.gameExamplesHeaderContainer}>
					<div className={styles.gameExamplesHeaderSelector}>
						{gamesList.map((item) => (
							<div className={styles.gameExampleButton} key={item.title}>
								{item.title}
							</div>
						))}
					</div>
					<div className={styles.gameDescription}>
						This is a test description
					</div>
				</div>
				<div className={styles.gameExamplesGridContainer}>
					<motion.div ref={ref} className={styles.gameExamples3DModel}>
						{isInView && (
							<Suspense fallback={<div>Loading 3D Model...</div>}>
								<ModelViewer />
							</Suspense>
						)}
					</motion.div>
					<div className={styles.gameExamplesImageCarousel}></div>
					<div className={styles.gameExampleMod1}></div>
					<div className={styles.gameExampleMod2}></div>
					<div className={styles.gameExampleMod3}></div>
				</div>
			</div>
		</div>
	);
};

export default GameExamples;
