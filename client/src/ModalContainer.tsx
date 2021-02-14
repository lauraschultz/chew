import React from "react";
import { useClickOutsideListenerRef } from "./useClickOutsideListenerRef";

const ModalContainer: React.FC<{ onClose: () => void; shadow?: boolean }> = ({
	onClose,
	shadow = true,
	children,
}) => {
	let ref = useClickOutsideListenerRef(onClose);

	return (
		<div className="w-screen h-screen fixed bg-gray-800 bg-opacity-75 flex justify-center items-center z-40 left-0 top-0">
			<div
				ref={ref}
				className={
					"rounded-lg max-w-sm m-2 overflow-hidden " +
					(shadow ? "shadow-2xl" : "")
				}
			>
				{children}
			</div>
		</div>
	);
};

export default ModalContainer;
