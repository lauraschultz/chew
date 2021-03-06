import React from "react";

const Toast: React.FC<{ show: boolean }> = ({ show, children }) => {
	return (
		<div
			className={
				"fixed z-50 right-0 bottom-0 mx-1 md:mx-3 shadow-xl transition-spacing duration-500 " +
				(show ? "my-1 md:my-3" : "-mb-24")
			}
		>
			{children}
		</div>
	);
};

export default Toast;
