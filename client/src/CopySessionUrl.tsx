import { faClipboard, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import QRCodeModal from "./QRCodeModal";

const CopySessionUrl: React.FC<{
	inputThemes: string;
	buttonThemes: string;
	buttonShadowColor: string;
}> = ({ inputThemes, buttonThemes, buttonShadowColor }) => {
	let copyTextRef = useRef<HTMLInputElement>(null);
	let [copied, setCopied] = useState(false);
	const [showQRCodeModal, setShowQRCodeModal] = useState(false);

	return (
		<>
			{showQRCodeModal && (
				<QRCodeModal
					sessionUrl={window.location.href}
					onClose={() => setShowQRCodeModal(false)}
				/>
			)}

			<div className="w-max-content text-sm m-1">
				<label className="sr-only" htmlFor="url">
					url of this session
				</label>
				<input
					id="url"
					type="text"
					ref={copyTextRef}
					readOnly
					className={
						"border rounded-l py-1 pl-2 w-32 overflow-hidden btn-focus text-sm " +
						inputThemes
					}
					value={window.location.href}
				/>

				<button
					aria-label={copied ? "Copied!" : "Copy to clipboard"}
					data-balloon-pos="up"
					className={`rounded-r py-1 px-2 border btn-focus ${buttonThemes}`}
					style={{
						boxShadow: `${buttonShadowColor} -5px 0 8px`,
					}}
					onClick={(e) => {
						copyTextRef.current?.select();
						document.execCommand("copy");
						setCopied(true);
					}}
				>
					<FontAwesomeIcon icon={faClipboard} />
				</button>
			</div>
			<button
				className="text-xs px-2 py-1 italic"
				onClick={() => setShowQRCodeModal((prev) => !prev)}
			>
				<FontAwesomeIcon icon={faQrcode} className="mr-1.5" />
				show QR code
			</button>
		</>
	);
};

export default CopySessionUrl;
