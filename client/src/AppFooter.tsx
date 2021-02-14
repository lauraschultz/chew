import React from "react";
import CopySessionUrl from "./CopySessionUrl";
import Waves from "./assets/waves.svg";
import FooterLinks from "./FooterLinks";

const AppFooter: React.FC = () => (
	<footer className="text-red w-full mt-4">
		<img src={Waves} alt="" className=" max-h-14 -mb-1" />
		<div className="bg-red text-gray-50 p-2 md:px-4 lg:px-24 block sm:flex justify-around items-center leading-tight">
			<div className="flex-initial p-2">
				<p className="mb-1">Share this session with others:</p>
				<CopySessionUrl
					buttonThemes="bg-gray-50 text-red border-gray-50"
					buttonShadowColor="#e8505b"
					inputThemes="border-gray-50 bg-red"
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
