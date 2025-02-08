import React from "react";
import styles from "./OurContent.module.css";
import { FaArrowRight } from "react-icons/fa";
const Ourcontent = () => {
	const cardOptions = [
		{ title: "Mod Development", description: "Mod Development" },
		{ title: "3D Assests & Maps", description: "3D Assests & Maps" },
		{ title: "Secure Transactions", description: "Secure Transactions" },
		{ title: "4th Cool Option", description: "4th Cool Option" },
	];

	return (
		<div className={styles.ourContentWrapper}>
			<div className={styles.headerWrapper}>
				Approved Mods, and More For Your Favorite games
			</div>
			<button>WHAT WE DO</button>

			<div className={styles.cardsWrapper}>
				{cardOptions.map((card, index) => (
					<div className={styles.cardContainer} key={index}>
						<div className={styles.hoverLine}></div>
						<div className={styles.cardContentWrapper}>
							<div className={styles.cardHeader}>{card.title}</div>
							<div className={styles.arrow}>
								<FaArrowRight />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Ourcontent;
