import React, { useCallback, useEffect, useRef, useState } from "react";
import ListDropdown from "./ListDropdown";
import poweredByGoogle from "./assets/powered_by_google_on_white.png";

let autoComplete: google.maps.places.AutocompleteService;

const loadScript = (
	url: string,
	callback: (this: GlobalEventHandlers, ev: Event) => any
) => {
	let script = document.createElement("script");
	script.type = "text/javascript";
	script.onload = callback;
	document.head.appendChild(script);
	script.src = url;
};

const PlacesAutocomplete: React.FC<{
	searchTerm: string;
	selectPlace: (pl: string) => void;
}> = ({ searchTerm, selectPlace }) => {
	let currentSearchTerm = useRef("");
	let [currentSearchResults, setCurrentSearchResults] = useState<string[]>([]);
	let scriptLoaded = useRef(false);
	let selectedText = useRef<string>();

	const handleScriptLoad = () => {
		autoComplete = new window.google.maps.places.AutocompleteService();
		scriptLoaded.current = true;
	};

	useEffect(() => {
		loadScript(
			`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_CLOUD_API_KEY}&libraries=places`,
			() => handleScriptLoad()
		);
	}, []);

	// if(Math.abs(searchTerm.length - currentSearchTerm.length)<2){
	//     setCurrentSearchTerm(searchTerm);
	// }

	useEffect(() => {
		if (
			scriptLoaded &&
			searchTerm &&
			searchTerm !== currentSearchTerm.current
			// Math.abs(searchTerm.length - currentSearchTerm.current.length) > 1
		) {
			currentSearchTerm.current = searchTerm;
			autoComplete.getPlacePredictions(
				{ input: searchTerm, types: ["(regions)"] },
				(result, status) => {
					setCurrentSearchResults(result.map((r) => r.description) || []);
				}
			);
		}
		// selectedText.current = undefined;
	}, [searchTerm]);

	// const select = (selectedItem: string) => {
	// 	selectedText.current = selectedItem;
	// 	selectPlace(selectedItem);
	// 	// setCurrentSearchResults([])
	// };

	// if (selectedText.current === searchTerm) {
	// 	return <ul ref={ref} />;
	// }

	const updateSelection = useCallback(
		(search: string) => {
			selectPlace(search);
			selectedText.current = search;
		},
		[selectPlace]
	);

	if (selectedText.current === searchTerm) {
		return null;
	}
	return (
		<ListDropdown
			items={currentSearchResults}
			updateSelection={updateSelection}
			last={
				<img
					src={poweredByGoogle}
					alt="powered by Google"
					className="float-right px-2 py-1 w-38"
				/>
			}
		/>
	);
};

export default PlacesAutocomplete;
