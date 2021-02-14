import React from "react";
import ModalContainer from "./ModalContainer";

const QRCodeModal: React.FC<{ sessionUrl: string; onClose: () => void }> = ({
	sessionUrl,
	onClose,
}) => {
	return (
		<ModalContainer onClose={onClose}>
			<div className="bg-white p-6 text-gray-800 text-lg">
				Scan this code to join the session:
				<img
					className="mx-auto my-6"
					height="174px"
					width="174px"
					src={`https://api.qrserver.com/v1/create-qr-code/?format=svg&data=${sessionUrl}&size=200x200`}
					alt="QR code for session url"
				/>
			</div>
		</ModalContainer>
	);
};

export default QRCodeModal;
