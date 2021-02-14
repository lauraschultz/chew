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
import AppFooter from "../AppFooter";
import ModalContainer from "../ModalContainer";
import ShareSessionModal from "../ShareSessionModal";
import socket from "../socket";
import Toast from "../Toast";
import { UserContext, UserContextConsumer } from "../UserDataContext";
import { UserNameModal } from "../UserNameModal";
import Display from "../Display";
import Search from "../Search";

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
	let [loaded, setLoaded] = useState(false);
	let [showVotingToast, setShowVotingToast] = useState(false);
	let [showShareSessionModal, setShowShareSessionModal] = useState(false);
	let [searchFormState, setSearchFormState] = useState<
		Partial<SearchFormState>
	>({});
	let history = useHistory();

	useEffect(() => {
		socket.subscribeToRestaurantAdded((newRestaurant: BusinessWithVotes) => {
			setAddedRestaurants((r) => ({
				...r,
				[newRestaurant.business.id]: newRestaurant,
			}));
		});

		socket.subscribeToRestaurantRemoved(
			(response: { restaurantId: string }) => {
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
				setAddedRestaurants((r) => {
					const updatedRestaurants = { ...r };
					updatedRestaurants[params.restaurantId].votes = params.votes;
					return { ...r, ...updatedRestaurants };
				});
			}
		);
		return () => {
			socket.unSubscribeToRestaurantAdded();
			socket.unSubscribeToRestaurantRemoved();
			socket.unSubscribeToVoteAdded();
		};
	}, [setPreviousVotes]);

	const voteOnRestaurant = (restaurantId: string, voteNum: number) =>
		socket.addVote(sessionId, userId, restaurantId, voteNum);

	const updateSearchFormState = useCallback(
		(s: Partial<SearchFormState>) =>
			setSearchFormState((old) => ({ ...old, ...s })),
		[setSearchFormState]
	);

	let search: ReactFragment = (
		<div className="flex-1 py-4 px-2 max-w-md w-full mx-auto">
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
		<div className="flex-1 py-4 px-2 max-w-md w-full divide-y divide-gray-300 mx-auto">
			<Display
				voteOnRestaurant={voteOnRestaurant}
				addedRestaurants={addedRestaurants}
			/>
		</div>
	);

	useEffect(() => {
		if (window.history?.state?.fromLogin) {
			setShowShareSessionModal(true);
			setLoaded(true);

			window.history.replaceState({ fromLogin: false }, "");
		} else if (sessionId !== "") {
			socket.tryJoinSession({ sessionId, userId }, (response) => {
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
					console.error("recieved failure from server");
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
	]);

	return (
		<>
			{showShareSessionModal && (
				<ModalContainer
					shadow={true}
					onClose={() => setShowShareSessionModal(false)}
				>
					<ShareSessionModal onClose={() => setShowShareSessionModal(false)} />
				</ModalContainer>
			)}
			{!loaded && (
				<ModalContainer shadow={false} onClose={() => {}}>
					<FontAwesomeIcon
						icon={faCircleNotch}
						size="5x"
						className="animate-spin text-yellow block"
					/>
				</ModalContainer>
			)}
			<Toast show={showVotingToast}>
				<div className="py-2 px-4 bg-gray-100 flex items-center rounded-md border text-sm">
					<FontAwesomeIcon
						icon={faBinoculars}
						className="flex-initial text-gray-800 p-1 pb-0"
						size="3x"
					/>
					<div className="flex-1 pl-3">
						<div className="text-md font-bold border-b border-gray-400 p-1">
							Currently in view-only mode.
						</div>
						<div className="text-gray-700 leading-tight p-1">
							<span
								className="border-b border-blue hover:text-blue cursor-pointer"
								onClick={() => {
									setShowVotingToast(false);
								}}
							>
								Join the session
							</span>
							&nbsp; to add restaurants and vote
						</div>
					</div>
				</div>
			</Toast>
			<UserContextConsumer>
				{(context) => (
					<>
						{loaded && context.userState !== "canVote" && !showVotingToast && (
							<ModalContainer
								shadow={true}
								onClose={() => setShowVotingToast(true)}
							>
								<UserNameModal escape={() => setShowVotingToast(true)} />
							</ModalContainer>
						)}
						<header className="bg-red text-gray-50 shadow ">
							<nav className="flex justify-between p-2 lg:p-4 lg:px-8">
								<Link to="/getStarted">
									<img
										className="text-gray-50 inline-block w-32 lg:w-38 flex-initial"
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
							<div className="lg:hidden uppercase font-bold tracking-wide p-2 pb-1 text-sm bg-red-dark">
								<NavLink
									to={`/ID/${context.sessionId}`}
									exact={true}
									className="p-1 m-1"
									activeClassName="border-b-2 border-gray-50"
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
									activeClassName="border-b-2 border-gray-50"
								>
									<FontAwesomeIcon icon={faSearch} size="sm" className="mr-2" />
									search
								</NavLink>
							</div>
						</header>
						<main className="flex-grow">
							{/* LARGE DISPLAYS */}
							<Media
								query="(min-width: 1024px)"
								render={() => (
									<Switch>
										<Route
											path="/ID/:sessionId"
											exact
											render={() => (
												<div className="flex justify-around px-1 max-w-7xl mx-auto">
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
								query="(max-width: 1023px)"
								render={() => (
									<Route
										path="/ID/:sessionId"
										render={({ location }) => (
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
