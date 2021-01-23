import React from "react";
import CopySessionUrl from "./CopySessionUrl";
import Waves from "./assets/waves.svg";
import FooterLinks from "./FooterLinks";

const AppFooter: React.FC = () => (
	<footer className="text-red w-full mt-4">
		<img src={Waves} alt="" />
		<div className="bg-red text-white p-2 md:px-4 lg:px-24 block sm:flex justify-around items-center leading-tight">
			<div className="flex-initial p-2">
				<p className="mb-1">Share this session with others:</p>
				<CopySessionUrl
					buttonThemes="bg-white text-red border-white"
					buttonShadowColor="#e8505b"
					inputThemes="border-white bg-red"
				/>
			</div>
			<div className="flex-initial p-2 text-xs">
				<FooterLinks />
			</div>

			{/* <Link to="">show restaurants</Link>
          <Link to="">show search</Link> */}
		</div>
	</footer>
);

export default AppFooter;
