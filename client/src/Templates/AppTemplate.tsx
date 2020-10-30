import {
	faBinoculars,
	faCircleNotch,
	faDoorOpen,
	faSearch,
	faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
	ReactFragment,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import Media from "react-media";
import {
	Link,
	NavLink,
	Redirect,
	Route,
	Switch,
	useHistory,
} from "react-router-dom";
import { Business, BusinessWithVotes } from "../../../shared/types";
import Logo from "../assets/chew_logo.svg";
import Display from "../Display";
import AppFooter from "../AppFooter";
import ModalContainer from "../ModalContainer";
import Search from "../Search";
import ShareSessionModal from "../ShareSessionModal";
import socket from "../socket";
import Toast from "../Toast";
import { UserContext, UserContextConsumer } from "../UserDataContext";
import { UserNameModal } from "../UserNameModal";

export interface SearchFormState {
	search: string;
	filter: FilterForm;
	results: Business[];
}

export interface FilterForm {
	openDate: "any" | "today";
	openNow: boolean;
	prices: (number | undefined)[];
	services: {
		pickup: boolean;
		delivery: boolean;
		restaurant_reservation: boolean;
	};
}

const AppTemplate: React.FC = () => {
	let [addedRestaurants, setAddedRestaurants] = useState<{
		[id: string]: BusinessWithVotes;
	}>({});
	let {
		sessionId,
		setSessionId,
		userId,
		userIdHash,
		setUserId,
		setUserState,
		location,
		setLocation,
		creator,
		setCreator,
		setPreviousVotes,
	} = useContext(UserContext);
	// let [isAdded, setIsAdded] = useState<{ [id: string]: boolean }>({});
	let [loaded, setLoaded] = useState(false);
	let [showVotingToast, setShowVotingToast] = useState(false);
	let [showShareSessionModal, setShowShareSessionModal] = useState(false);
	let [searchFormState, setSearchFormState] = useState<
		Partial<SearchFormState>
	>({});
	let history = useHistory();

	useEffect(() => {
		socket.subscribeToRestaurantAdded((newRestaurant: BusinessWithVotes) => {
			console.log("recieving an added restaurant.");
			setAddedRestaurants((r) => ({
				...r,
				[newRestaurant.business.id]: newRestaurant,
			}));
		});

		socket.subscribeToRestaurantRemoved(
			(response: { restaurantId: string }) => {
				console.log("recieving an removed restaurant.");
				setAddedRestaurants((r) => {
					let clone = Object.assign({}, r);
					delete clone[response.restaurantId];
					return clone;
				});
				setPreviousVotes((r: { [restId: string]: number }) => {
					let clone = Object.assign({}, r);
					delete clone[response.restaurantId];
					return clone;
				});
			}
		);

		socket.subscribeToVoteAdded(
			(params: { restaurantId: string; votes: string[] }) => {
				setAddedRestaurants((r) => ({
					...r,
					[params.restaurantId]: {
						...r[params.restaurantId],
						votes: params.votes,
					},
				}));
			}
		);
		return () => {
			socket.unSubscribeToRestaurantAdded();
			socket.unSubscribeToRestaurantRemoved();
			socket.unSubscribeToVoteAdded();
		};
	}, []);

	const voteOnRestaurant = (restaurantId: string, voteNum: number) =>
		socket.addVote(sessionId, userId, restaurantId, voteNum);

	const updateSearchFormState = useCallback(
		(s: Partial<SearchFormState>) =>
			setSearchFormState((old) => ({ ...old, ...s })),
		[setSearchFormState]
	);

	let search: ReactFragment = (
		<div className="flex-1 pt-4">
			<Search
				voteOnRestaurant={voteOnRestaurant}
				isAdded={addedRestaurants}
				userIdHash={userIdHash}
				sessionId={sessionId}
				location={location}
				creator={creator}
				searchFormState={searchFormState}
				updateSearchFormState={updateSearchFormState}
			/>
		</div>
	);

	let display: ReactFragment = (
		<div className="flex-1 pt-4">
			<Display
				voteOnRestaurant={voteOnRestaurant}
				addedRestaurants={addedRestaurants}
			/>
		</div>
	);

	// useEffect(() => {
	// 	const newIsAdded: { [id: string]: boolean } = {};
	// 	Object.keys(addedRestaurants).forEach(
	// 		(restId) => (newIsAdded[restId] = true)
	// 	);
	// 	setIsAdded(newIsAdded);
	// }, [addedRestaurants]);

	useEffect(() => {
		if (window.history?.state?.fromLogin) {
			setShowShareSessionModal(true);
			setLoaded(true);

			// history.replace(history.location, {fromLogin:false})
			// appLoc.state = {fromLogin:false}

			window.history.replaceState({ fromLogin: false }, "");
		} else if (sessionId !== "") {
			socket.tryJoinSession({ sessionId, userId }, (response) => {
				console.log(
					`response from tryJoinSession is ${JSON.stringify(response)}`
				);
				if (response.success) {
					setShowVotingToast(false);
					setSessionId(sessionId);
					setUserId(response.userId);
					setUserState(
						response.previouslyAuthenticated ? "canVote" : "canView"
					);
					setLocation(response.location);
					setCreator(response.creator);
					setPreviousVotes(response.previousVotes);
					setAddedRestaurants(response.restaurants || {});
					setLoaded(true);
				} else {
					history.push("/404");
					console.log("recieved failure from server");
				}
			});
		}
	}, [
		sessionId,
		history,
		setCreator,
		setLocation,
		setPreviousVotes,
		setSessionId,
		setUserId,
		setUserState,
		userId,
	]); //sessionId

	return (
		<>
			{showShareSessionModal && (
				<ModalContainer shadow={true}>
					<ShareSessionModal escape={() => setShowShareSessionModal(false)} />
				</ModalContainer>
			)}
			{!loaded && (
				<ModalContainer shadow={false}>
					<FontAwesomeIcon
						icon={faCircleNotch}
						size="5x"
						className="animate-spin text-theme-yellow block"
					/>
				</ModalContainer>
			)}
			<Toast show={showVotingToast}>
				<div className="p-2 pt-1 md:p-3 md:pt-2 bg-gray-100 flex items-center rounded-md border">
					<FontAwesomeIcon
						icon={faBinoculars}
						className="flex-initial text-gray-800 p-1 pb-0"
						size="3x"
					/>
					<div className="flex-1 pl-3">
						<div className="text-md font-bold border-b border-gray-400 px-1">
							Currently in view-only mode.
						</div>
						<div className="text-gray-700 leading-tight mt-1 px-1">
							<span
								className="border-b-2 border-theme-blue hover:text-theme-blue cursor-pointer"
								onClick={() => {
									setShowVotingToast(false);
								}}
							>
								Join the session
							</span>{" "}
							to add restaurants and vote
						</div>
					</div>
				</div>
			</Toast>
			<UserContextConsumer>
				{(context) => (
					<>
						{loaded && context.userState !== "canVote" && !showVotingToast && (
							<ModalContainer shadow={true}>
								<UserNameModal escape={() => setShowVotingToast(true)} />
							</ModalContainer>
						)}
						<header className="bg-theme-red text-white shadow ">
							<nav className="flex justify-between p-1 lg:py-2 lg:px-4">
								<Link to="/getStarted">
									<img
										className="text-white inline-block w-32 lg:w-38 flex-initial"
										src={Logo}
										alt="chew logo"
									/>
								</Link>
								<Link
									to="/getStarted"
									className="inline-block flex-initial self-center text-sm"
								>
									leave this group <FontAwesomeIcon icon={faDoorOpen} />
								</Link>
							</nav>
							<div className="md:hidden uppercase font-bold tracking-wide py-1 text-sm bg-theme-dark-red">
								<NavLink
									to={`/ID/${context.sessionId}`}
									exact={true}
									className="p-1 m-1"
									activeClassName="border-b-2 border-white"
								>
									<FontAwesomeIcon
										icon={faUtensils}
										size="sm"
										className="mr-2"
									/>
									view restaurants
								</NavLink>
								<NavLink
									to={`/ID/${context.sessionId}/search`}
									exact={true}
									className="p-1 m-1"
									activeClassName="border-b-2 border-white"
								>
									<FontAwesomeIcon icon={faSearch} size="sm" className="mr-2" />
									search
								</NavLink>
							</div>
						</header>
						<main className="flex-grow">
							{/* LARGE DISPLAYS */}
							<Media
								query="(min-width: 768px)"
								render={() => (
									<Switch>
										<Route
											path="/ID/:sessionId"
											exact
											render={() => (
												<div className="flex justify-around px-1">
													{display} {search}
												</div>
											)}
										/>
										<Route
											path="/"
											render={() => (
												<Redirect to={`/ID/${context.sessionId}`} />
											)}
										/>
									</Switch>
								)}
							/>

							{/* SMALL DISPLAYS */}
							<Media
								query="(max-width: 767px)"
								render={() => (
									<Route
										path="/ID/:sessionId"
										render={({ location }) => (
											// <div className="w-screen overflow-x-hidden">
											//   <div
											//     className={"whitespace-no-wrap transition-spacing " + (location.pathname.search("search") > -1 ? '-ml-screen': 'm-0')}
											//     // style={
											//     //   location.pathname.search("search") > -1
											//     //     ? { marginLeft: "-100vw" }
											//     //     : { marginLeft: "0" }
											//     // }
											//   >
											//     <div className="w-screen inline-block">{display}</div>
											//     <div className="w-screen inline-block">{search}</div>
											//   </div>
											// </div>

											<Switch>
												<Route
													path="/ID/:sessionId"
													exact
													render={() => display}
												/>
												<Route
													path="/ID/:sessionId/search"
													exact
													render={() => search}
												/>
											</Switch>
										)}
									/>
								)}
							/>
						</main>
						<AppFooter />
					</>
				)}
			</UserContextConsumer>
		</>
	);
};

export default AppTemplate;
