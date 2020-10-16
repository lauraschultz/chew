import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { googleApiKey } from "./config";
import { rejects } from "assert";

interface PlacesSearchResult {
  id: string;
  description: string;
}

// https://github.com/Gapur/google-place-autocomplete/blob/master/src/SearchLocationInput.js
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

const PlacesAutocomplete: React.FC<{ searchTerm: string, selectPlace: (pl:string) => void }> = ({
  searchTerm, selectPlace
}) => {
  let currentSearchTerm = useRef("");
  let [currentSearchResults, setCurrentSearchResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  let scriptLoaded = useRef(false);
  let selectedText = useRef<string>();
  console.log(`re-render`)
// let scriptLoaded = false;

  const handleScriptLoad = () => {
    autoComplete = new window.google.maps.places.AutocompleteService();
    scriptLoaded.current = true;
  };

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`,
      () => handleScriptLoad()
    );
  }, []);

  // if(Math.abs(searchTerm.length - currentSearchTerm.length)<2){
  //     setCurrentSearchTerm(searchTerm);
  // }

  if (
    scriptLoaded &&
    searchTerm &&
    Math.abs(searchTerm.length - currentSearchTerm.current.length) > 1
  ) {
      console.log(`setting current search term to ${searchTerm}`)
    currentSearchTerm.current = searchTerm;
    autoComplete.getPlacePredictions(
      { input: searchTerm , types: ["(regions)"]},
      (result, status) => {
        console.log(`result is ${JSON.stringify(result)}`);
        setCurrentSearchResults(result || []);
      }
    );
  }

  const select = (selectedItem: string) => {
    selectedText.current = selectedItem;
    selectPlace(selectedItem);
    // setCurrentSearchResults([])
  }

  //   const placesApiCall = (search: string): Promise<PlacesSearchResult[]> => {
  //     return new Promise((resolve, reject) =>
  //       axios({
  //         method: "GET",
  //         url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${googleApiKey}&input=${searchTerm}&type=(regions)`,
  //         headers: {
  //           // authorization: `Bearer f58cbM8m4Vb4JbymCIx2oSimETv2`,
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then((result) =>
  //           resolve(
  //             result.data.predictions.map((p: any) => ({
  //               description: p.description,
  //               id: p.id,
  //             }))
  //           )
  //         )
  //         .catch(() => reject())
  //     );
  //   };

  //   placesApiCall(searchTerm).then((results) =>
  //   setCurrentSearchResults(results))

  if(selectedText.current === searchTerm) {
      return null;
  }
  return (
    <ul className="absolute bg-white z-40 -ml-1 mt-1 divide-y shadow">
      {currentSearchResults.map((r) => (
        <li key={r.id} className="px-2 py-1 hover:bg-theme-blue hover:text-white cursor-pointer"
        onClick={() => select(r.description)}>{r.description}</li>
      ))}
    </ul>
  );
};

export default PlacesAutocomplete;
