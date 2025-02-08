"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { motion } from "motion/react";
import OurContent from "./components/OurContent/OurContent";
import GameExamples from "./components/GameExamples/GameExamples";
import AnimatedGridBackground from "./components/AnimatedGridBackground/AnimatedGridBackground";

export default function Home() {
	return (
		<div className={styles.page}>
			<div className={styles.jumbotronContainer}>
				<AnimatedGridBackground />
				<div className={styles.jumbotronContent}>
					<div className={styles.headerWrapper}>
						<motion.div
							animate={{
								top: [50, 0],
								opacity: [0, 1],
								transition: { opacity: { duration: 1 } },
							}}
							className={styles.pageHeader}
						>
							<motion.span
								animate={{
									width: "100%",
									padding: "0px 20px 0px 20px",
									opacity: [1, 0, 1],
									transition: {
										width: { duration: 0.3, delay: 0.2 },

										opacity: {
											duration: 0.15,
											repeat: 2,
										},
									},
								}}
								className={styles.amoxTextBackground}
							></motion.span>
							AMOX STUDIOS
						</motion.div>
						<motion.div
							animate={{
								top: [50, 0],
								opacity: [0, 1],
								transition: {
									opacity: { duration: 1 },
									top: { delay: 0.3 },
									opacity: { delay: 0.3 },
								},
							}}
							className={styles.headerDescription}
						>
							Welcome to our world of 3D models, mods, and plugins. We offer the
							best forms of customer and developer experience.
						</motion.div>
						<div className={styles.buttonsContainer}>
							<motion.button
								animate={{
									opacity: [0, 1],
									top: [50, 0],
									transition: { top: { delay: 0.6 }, opacity: { delay: 0.6 } },
								}}
								className={styles.primaryButton}
							>
								WHAT WE DO
							</motion.button>
							<motion.button
								animate={{
									opacity: [0, 1],
									top: [50, 0],
									transition: { top: { delay: 0.7 }, opacity: { delay: 0.7 } },
								}}
								className={styles.secondaryButton}
							>
								View Works
							</motion.button>
						</div>
					</div>
				</div>
			</div>

			<OurContent />
			<GameExamples />
		</div>
	);
}
