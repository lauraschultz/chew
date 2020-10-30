import React, { ReactFragment, useEffect, useState } from "react";
import { useClickOutsideListenerRef } from "./useClickOutsideListenerRef";

const ListDropdown: React.FC<{
	items: string[];
	updateSelection: (s: string) => void;
	last?: ReactFragment;
}> = ({ items, updateSelection, last }) => {
	let [show, setShow] = useState(true);
	let [hoveredIdx, setHoveredIdx] = useState(-1);
	let ref = useClickOutsideListenerRef(() => setShow(false));

	useEffect(() => setShow(true), [items]);
	const keyPressEvent = (e: KeyboardEvent) => {
		switch (e.key) {
			case "ArrowDown":
				setHoveredIdx((val) => (val + 1) % items.length);
				break;
			case "ArrowUp":
				setHoveredIdx(
					(val) => (((val - 1) % items.length) + items.length) % items.length
				);
				break;
			case "Escape":
				setHoveredIdx(-1);
				break;
			case "Enter":
				if (hoveredIdx > -1 && items.length > 0) {
					e.preventDefault();
					updateSelection(items[hoveredIdx]);
					setShow(false);
					setHoveredIdx(-1);
				}
		}
	};
	useEffect(() => {
		window.addEventListener("keydown", keyPressEvent);

		return () => window.removeEventListener("keydown", keyPressEvent);
	});

	if (show) {
		return (
			<ul
				ref={ref}
				className="absolute bg-white z-40 divide-y shadow text-sm rounded-b overflow-hidden"
			>
				{items.map((i, idx) => (
					<li
						key={idx}
						onMouseOver={(e) => setHoveredIdx(idx)}
						className={
							"px-2 py-1 cursor-pointer " +
							(hoveredIdx === idx ? "bg-theme-blue-l-2 text-white" : "")
						}
						onClick={() => {
							updateSelection(i);
							setShow(false);
						}}
					>
						{i}
					</li>
				))}
				{items.length > 0 && last && <li>{last}</li>}
			</ul>
		);
	}
	return <ul ref={ref} className="hidden" />;
};
export default ListDropdown;
