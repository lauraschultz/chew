import {
  faExclamationCircle,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { stat } from "fs";
import React, { useEffect, useReducer, useState } from "react";
import { FilterResults } from "./Search";

interface FilterForm {
  openDate: "any" | "today";
  openNow: boolean;
  prices: (number | undefined)[];
  services: {
    pickup: boolean;
    delivery: boolean;
    restaurant_reservation: boolean;
  };
}

const Filters: React.FC<{ update: (newFilters: FilterResults) => void }> = ({
  update,
}) => {
  const initialForm: FilterForm = {
    openDate: "any",
    openNow: false,
    prices: [0, 3],
    services: {
      pickup: true,
      delivery: true,
      restaurant_reservation: true,
    },
  };
  let [showFilters, setShowFilters] = useState(false);
  const [state, dispatch] = useReducer(formReducer, initialForm);
  //   let [[price1, price2], setPrices] = useState<(number | undefined)[]>([0, 3]);
  let onlyOnePriceSet: boolean;
  // let regularBool = true;
  // let [onlyOnePriceSet, setOnlyOnePriceSet] = useState(false);
  useEffect(() => {
    onlyOnePriceSet = !(state.prices[0]! > -1 && state.prices[1]! > -1);
    console.log(`onlyonepriceset is ${onlyOnePriceSet}`);
  }, [state.prices]);

  const min = (arr: (number | undefined)[]) => {
    let min = 99;
    arr.forEach((n) => {
      if (typeof n === "number" && n < min) {
        min = n;
      }
    });
    console.log(`the min of ${arr} is ${min}.`);
    return min;
  };

  useEffect(() => {
    update({
      openHours:
        state.openDate === "any" ? "any" : state.openNow ? "now" : "today",
      priceRange: new Array(
        state.prices[1] === undefined
          ? 1
          : Math.abs(state.prices[0]! - state.prices[1]!) + 1
      )
        .fill(0)
        .map((_, idx) => min(state.prices) + 1 + idx)
        .join(","),
      services: Object.entries(state.services)
        .filter(([_, b]) => b)
        .map(([e, _]) => e)
        .join(","),
    });
  }, [state]);

  const isBetween = (n: number, stops: (number | undefined)[]) => {
    if (!(typeof stops[0] === "number" && typeof stops[1] === "number")) {
      return false;
    }
    return (stops[0] < n && n < stops[1]) || (stops[1] < n && n < stops[0]);
  };
  const priceArray = new Array(4).fill("").map((a, b) => "$".repeat(b + 1));
  const selectedPriceStyles =
    "bg-theme-blue text-white px-1 py-2 rounded-full z-30 ";
  const intermediatePriceStyles =
    "bg-theme-blue-l-3 text-black py-1 px-4 -mx-2 z-20 ";

  return (
    <>
      <button
        type="button"
        className="mx-2 px-2 py-1 text-theme-blue border border-theme-blue bg-white rounded shadow font-bold text-sm uppercase tracking-wide"
        onClick={() => setShowFilters(!showFilters)}
      >
        <FontAwesomeIcon icon={faSlidersH} className="mr-2" />
        {showFilters ? "hide" : "show"} filters
      </button>
      <div className={"p-2 flex flex-wrap border-b border-theme-extra-light-gray " + (showFilters ? "" : "hidden")}>
          <div className="w-full sm:w-1/2">
            <span className="text-sm font-bold uppercase tracking-wide text-theme-med-gray">
              Price Range
            </span>

            <div className="group mt-1 ml-2 mb-3 text-sm">
              {priceArray.map((d, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => dispatch({ key: "price", newVal: idx })}
                  className={
                    "relative px-2 " +
                    (state.prices.includes(idx) ? selectedPriceStyles : "") +
                    (onlyOnePriceSet
                      ? "hover:bg-theme-blue bg-opacity-50"
                      : isBetween(idx, state.prices)
                      ? intermediatePriceStyles
                      : "")
                  }
                  // className={idx===price1 ? "rounded-full bg-theme-blue text-white" : "" + onlyOnePriceSet ? "bg-opacity-50" : ""}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-theme-med-gray">
              Open Hours
            </span>
            <label className="block px-2">
              <input
                className="mr-2"
                checked={state.openDate === "any"}
                type="radio"
                name="day"
                onChange={() => dispatch({ newVal: "any", key: "openDate" })}
              />
              Any time
            </label>
            <label className="block px-2">
              <input
                className="mr-2"
                checked={state.openDate === "today"}
                type="radio"
                name="day"
                onChange={() => dispatch({ newVal: "today", key: "openDate" })}
              />
              Today
              <label className="block px-4 -mt-1 mb-2">
                <input
                  className="mr-2"
                  checked={state.openNow}
                  type="checkbox"
                  onChange={() => dispatch({ key: "openNow" })}
                />
                Open now
              </label>
            </label>
          </div>
          <div className="w-full sm:w-1/2">
            <span className="text-sm font-bold uppercase tracking-wide text-theme-med-gray">
              Services Offered
            </span>
            <label className="block px-2">
              <input
                className="mr-2"
                checked={state.services.pickup}
                type="checkbox"
                onChange={() => dispatch({ key: "pickup" })}
              />
              Pickup
            </label>
            <label className="block px-2">
              <input
                className="mr-2"
                checked={state.services.delivery}
                type="checkbox"
                onChange={() => dispatch({ key: "delivery" })}
              />
              Delivery
            </label>
            <label className="block px-2">
              <input
                className="mr-2"
                checked={state.services.restaurant_reservation}
                type="checkbox"
                onChange={() => dispatch({ key: "restaurant_reservation" })}
              />
              Restaurant reservation
            </label>
            <div
              className={
                !(
                  state.services.pickup ||
                  state.services.delivery ||
                  state.services.restaurant_reservation
                )
                  ? "mx-6 my-1 bg-white bg-opacity-50 border-l-4 border-orange-500 px-2 py-1 rounded text-sm italic"
                  : "hidden"
              }
            >
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-orange-500 mr-2"
              />
              Please select at least one service.
            </div>
          </div>
        </div>
    </>
  );
};

function formReducer(
  prevState: FilterForm,
  update: { newVal?: any; key: string }
): FilterForm {
  const newState: Partial<FilterForm> = {};
  if (update.key === "openDate") {
    if (update.newVal === "any") {
      newState.openDate = "any";
      newState.openNow = false;
    } else {
      newState.openDate = "today";
    }
  } else if (update.key === "openNow") {
    newState.openNow = !prevState.openNow;
    if (newState.openNow) {
      newState.openDate = "today";
    }
  } else if (
    update.key === "delivery" ||
    update.key === "pickup" ||
    update.key === "restaurant_reservation"
  ) {
    newState.services = {
      ...prevState.services,
      [update.key]: !prevState.services[update.key],
    };
  } else if (update.key === "price") {
    if (
      typeof prevState.prices[0] === "number" &&
      typeof prevState.prices[1] === "number"
    ) {
      newState.prices = [update.newVal, undefined];
    } else if (typeof prevState.prices[0] === "number") {
      newState.prices = [prevState.prices[0], update.newVal];
    }
  }

  return { ...prevState, ...newState };
}

export default Filters;
