import React, { useEffect, useRef, useState } from "react";
import { googleCloudApiKey } from "./config";
import { useClickOutsideListenerRef } from "./useClickOutsideListenerRef";

interface PlacesSearchResult {
  id: string;
  description: string;
}

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

// function handleScriptLoad() {
//   //   autoComplete = new (window as any).google.maps.places.Autocomplete(
//   //     searchTerm,
//   //     { types: ["(regions)"] }
//   //   );
//   //   autoComplete.setFields(["address_components", "formatted_address"]);
//   //   autoComplete.addListener("place_changed", () =>
//   //     handlePlaceSelect(updateQuery)
//   //   );
// }

const PlacesAutocomplete: React.FC<{
  searchTerm: string;
  selectPlace: (pl: string) => void;
}> = ({ searchTerm, selectPlace }) => {
  let currentSearchTerm = useRef("");
  let [currentSearchResults, setCurrentSearchResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  let [hoveredIdx, setHoveredIdx] = useState(-1);
  let scriptLoaded = useRef(false);
  let selectedText = useRef<string>();
  const ref = useClickOutsideListenerRef(() => setCurrentSearchResults([]));

  const handleScriptLoad = () => {
    autoComplete = new window.google.maps.places.AutocompleteService();
    scriptLoaded.current = true;
  };

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${googleCloudApiKey}&libraries=places`,
      () => handleScriptLoad()
    );
  }, []);

  const keyPressEvent = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        setHoveredIdx((val) => (val + 1) % currentSearchResults.length);
        break;
      case "ArrowUp":
        setHoveredIdx(
          (val) =>
            (((val - 1) % currentSearchResults.length) +
              currentSearchResults.length) %
            currentSearchResults.length
        );
        break;
      case "Escape":
        setCurrentSearchResults([]);
        setHoveredIdx(-1);
        break;
      case "Enter":
        if (hoveredIdx > -1 && currentSearchResults.length > 0) {
          e.preventDefault();
          select(currentSearchResults[hoveredIdx].description);
        setCurrentSearchResults([]);
        setHoveredIdx(-1);
        }
        

    }
  };
  useEffect(() => {
    window.addEventListener("keydown", keyPressEvent);

    return () => window.removeEventListener("keydown", keyPressEvent);
  });

  // if(Math.abs(searchTerm.length - currentSearchTerm.length)<2){
  //     setCurrentSearchTerm(searchTerm);
  // }

  if (
    scriptLoaded &&
    searchTerm &&
    Math.abs(searchTerm.length - currentSearchTerm.current.length) > 1
  ) {
    currentSearchTerm.current = searchTerm;
    autoComplete.getPlacePredictions(
      { input: searchTerm, types: ["(regions)"] },
      (result, status) => {
        setCurrentSearchResults(result || []);
      }
    );
  }

  const select = (selectedItem: string) => {
    selectedText.current = selectedItem;
    selectPlace(selectedItem);
    // setCurrentSearchResults([])
  };

  if (selectedText.current === searchTerm) {
    return <ul ref={ref} />;
  }

  const poweredByGoogle = require("./assets/powered_by_google_on_white.png");
  return (
    <ul
      ref={ref}
      className="absolute bg-white z-40 divide-y shadow text-sm rounded-b overflow:hidden"
    >
      {currentSearchResults.map((r, idx) => (
        <li
          key={r.id}
          onMouseOver={(e) => setHoveredIdx(idx)}
          className={
            "px-2 py-1 cursor-pointer " +
            (hoveredIdx === idx ? "bg-theme-blue-l-2 text-white" : "")
          }
          onClick={() => select(r.description)}
        >
          {r.description}
        </li>
      ))}
      {currentSearchResults.length > 0 && (
        <img src={poweredByGoogle} alt="powered by Google" className="float-right px-2 py-1 w-38" />
      )}
    </ul>
  );
};

export default PlacesAutocomplete;
