import React from "react";
import ModalWelcomeHeader from "./ModalWelcomeHeader";
import CopySessionUrl from "./CopySessionUrl";

const ShareSessionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	return (
		<>
			<ModalWelcomeHeader onClose={onClose} />
			<div className="pb-4 pt-1 px-6 rounded-b bg-gray-50 text-gray-700">
				Share this url with others:
				<div className="mt-1 mb-4 mx-auto w-max-content">
					<CopySessionUrl
						buttonThemes="bg-green-500 border-green-500 text-gray-50"
						buttonShadowColor="white"
						inputThemes="border-gray-300"
					/>
				</div>
				<button
					onClick={onClose}
					className="py-1 uppercase tracking-wide text-sm border border-gray-700 w-full mt-2 rounded shadow font-bold btn-focus"
					aria-label="dismiss"
				>
					dismiss
				</button>
			</div>
		</>
	);
};

export default ShareSessionModal;
