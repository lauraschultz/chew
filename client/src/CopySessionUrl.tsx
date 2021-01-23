import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";

const CopySessionUrl: React.FC<{
	inputThemes: string;
	buttonThemes: string;
	buttonShadowColor: string;
}> = ({ inputThemes, buttonThemes, buttonShadowColor }) => {
	let copyTextRef = useRef<HTMLInputElement>(null);
	let [copied, setCopied] = useState(false);

	return (
		<div className="w-max-content text-sm m-1">
			<input
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
	);
};

export default CopySessionUrl;
