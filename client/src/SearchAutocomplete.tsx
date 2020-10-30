import React, { useCallback, useEffect, useRef, useState } from "react";
import ListDropdown from "./ListDropdown";
import socket from "./socket";

const SearchAutocomplete: React.FC<{
	sessionId: string;
	searchInput: string;
	selectItem: (i: string) => void;
}> = ({ sessionId, searchInput, selectItem }) => {
	let [searchResults, setSearchResults] = useState<string[]>([]);
	let currentSearch = useRef<string>();
	let selectedText = useRef<string>();

	useEffect(() => {
		if (searchInput && currentSearch.current !== searchInput) {
			socket.autocomplete(sessionId, searchInput).then((results) => {
				currentSearch.current = searchInput;
				setSearchResults(results);
			});
		}
	}, [searchInput, sessionId]);

	const updateSelection = useCallback(
		(selectedItem: string) => {
			selectedText.current = selectedItem;
			selectItem(selectedItem);
		},
		[selectItem]
	);

	if (selectedText.current === searchInput) {
		return null;
	}
	return (
		<ListDropdown items={searchResults} updateSelection={updateSelection} />
	);
};

export default SearchAutocomplete;
