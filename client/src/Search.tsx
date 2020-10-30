import React, {
	useState,
	FormEvent,
	useContext,
	useEffect,
	useCallback,
} from "react";
import { Business, BusinessWithVotes } from "../../shared/types";
import Vote from "./Vote";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleNotch,
	faInfoCircle,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";
import DisplayItem from "./DisplayItem";
import socket from "./socket";
import Filters from "./Filters";
import AddRestaurantButton from "./AddRestaurantButton";
import { UserContext } from "./UserDataContext";
import { SearchFormState } from "./Templates/AppTemplate";
import SearchAutocomplete from "./SearchAutocomplete";

const DisplaySearchResults: React.FC<{
	businesses?: Business[];
	voteOnRestaurant: Function;
	isAdded: { [id: string]: BusinessWithVotes };
}> = ({ businesses, voteOnRestaurant, isAdded }) => {
	let {
		sessionId,
		userId,
		userState,
		previousVotes,
		setPreviousVotes,
	} = useContext(UserContext);
	if (businesses?.length === 0) {
		return (
			<div className="uppercase font-bold tracking-wide text-sm text-theme-light-gray px-6 py-2">
				No results.
			</div>
		);
	}
	return (
		<ul className="divide-y divide-theme-extra-light-gray">
			{businesses?.map((b) => (
				<li key={b.id}>
					<DisplayItem
						restaurant={{ business: b, votes: [] }}
						addRestaurant={
							<AddRestaurantButton
								isRestaurantsAdded={!!isAdded[b.id]}
								userState={userState}
								sessionId={sessionId}
								userId={userId}
								businessId={b.id}
							/>
						}
						vote={
							isAdded[b.id] ? (
								<Vote
									currentVote={previousVotes[b.id]}
									addVote={(v: number) => {
										voteOnRestaurant(b.id, v);
										setPreviousVotes(
											(old: { [restaurantId: string]: number }) => ({
												...old,
												[b.id]: v,
											})
										);
									}}
								/>
							) : null
						}
					/>
				</li>
			))}
		</ul>
	);
};

export type FilterResults = {
	openHours: "any" | "today" | "now";
	priceRange: string;
	services: string;
};

const Search: React.FC<{
	sessionId: string;
	location: string;
	creator: { name: string; hashId: string };
	userIdHash: string;
	voteOnRestaurant: Function;
	isAdded: { [id: string]: BusinessWithVotes };
	searchFormState: Partial<SearchFormState>;
	updateSearchFormState: (s: Partial<SearchFormState>) => void;
}> = ({
	sessionId,
	location,
	creator,
	userIdHash: userHashId,
	voteOnRestaurant,
	isAdded,
	searchFormState,
	updateSearchFormState,
}) => {
	let [searchTerm, setSearchTerm] = useState(searchFormState.search || "");
	let [businesses, setBusinesses] = useState(searchFormState.results);
	let [loadingSearch, setLoadingSearch] = useState(false);
	let [filterResults, setFilterResults] = useState<FilterResults>();
	const updateFilter = useCallback(
		(r: FilterResults) => {
			setFilterResults(r);
		},
		[setFilterResults]
	);

	useEffect(() => {
		updateSearchFormState({ search: searchTerm, results: businesses });
	}, [searchTerm, businesses, updateSearchFormState]);

	return (
		<div className="max-w-md w-full mx-auto">
			<h2 className="max-w-md mx-auto text-2xl px-1 text-theme-dark-gray font-display leading-none mb-1">
				Search
			</h2>
			<hr className="border-theme-extra-light-gray" />
			<form
				className="p-2 w-full"
				onSubmit={(e: FormEvent) => {
					e.preventDefault();
					setLoadingSearch(true);
					setBusinesses(undefined);
					socket
						.search(
							sessionId,
							searchTerm,
							filterResults?.openHours || "",
							filterResults?.priceRange || "",
							filterResults?.services || ""
						)
						.then((b: Business[]) => {
							setBusinesses(b);
							setLoadingSearch(false);
						})
						.catch((e) => console.log(`oopsies ${e}`));
				}}
			>
				<div className="text-theme-light-gray italic -mt-1">
					{creator?.hashId === userHashId ? "You" : creator?.name} set the
					location to{" "}
					<span className="uppercase text-sm font-bold">
						{location}
						<button
							type="button"
							aria-label="Search results will not be strictly within this area; it serves as a starting point."
							data-balloon-pos="down"
							data-balloon-length="medium"
							className="btn-focus rounded-full"
						>
							<FontAwesomeIcon icon={faInfoCircle} className="ml-1" />
						</button>
					</span>
				</div>
				<div className="m-1 inline-block">
					<input
						className="rounded py-1 px-2 shadow btn-focus"
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<SearchAutocomplete
						sessionId={sessionId}
						searchInput={searchTerm}
						selectItem={setSearchTerm}
					/>
				</div>

				<button
					className="shadow py-1 px-2 m-1 text-white bg-theme-blue rounded-full btn-focus rounded-full"
					type="submit"
				>
					<FontAwesomeIcon aria-label="search" icon={faSearch} />
				</button>
				<Filters
					update={updateFilter}
					updateSearchFormState={updateSearchFormState}
					searchFormFilterState={searchFormState.filter}
				/>
			</form>
			{loadingSearch && (
				<FontAwesomeIcon
					icon={faCircleNotch}
					size="5x"
					className="animate-spin text-theme-yellow mx-auto my-4 block"
				/>
			)}
			<DisplaySearchResults
				businesses={businesses}
				voteOnRestaurant={voteOnRestaurant}
				isAdded={isAdded}
			/>
		</div>
	);
};

export default Search;
