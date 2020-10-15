import {
  faBinoculars,
  faDoorOpen,
  faSearch,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactFragment, useContext, useEffect, useState } from "react";
import Media from "react-media";
import { Link, NavLink, Redirect, Route, Switch } from "react-router-dom";
import { BusinessWithVotes } from "../../../shared/types";
import Logo from "../assets/chew_logo.svg";
import Display from "../Display";
import Footer from "../Footer";
import ModalContainer from "../ModalContainer";
import Search from "../Search";
// import { setUserName } from "../socket";
import socket from "../socket";
import Toast from "../Toast";
import { UserContext, UserContextConsumer } from "../UserDataContext";
import { UserNameModal } from "../UserNameModal";

// interface Props extends RouteComponentProps<{ sessionId: string }> {
//   search: ReactFragment;
//   display: ReactFragment;
// }

const AppTemplate: React.FC = () => {
  let [addedRestaurants, setAddedRestaurants] = useState<{
    [id: string]: BusinessWithVotes;
  }>({});
  let {
    sessionId,
    setSessionId,
    userId,
    setUserId,
    preAuthenticated,
    userState,
    setUserState,
    location,
    setLocation,
    creatorName,
    setCreatorName,
  } = useContext(UserContext);
  let [isAdded, setIsAdded] = useState<{ [id: string]: boolean }>({});
  let [loaded, setLoaded] = useState(false);
  let [showVotingToast, setShowVotingToast] = useState(false);

  useEffect(() => {
    console.log("subscribing to socket events");
    socket.subscribeToRestaurantAdded((newRestaurant: BusinessWithVotes) => {
      console.log("recieving an added restaurant.");
      setAddedRestaurants((r) => ({
        ...r,
        [newRestaurant.business.id]: newRestaurant,
      }));
    });

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
      socket.unSubscribeToVoteAdded();
    };
  }, []);

  const voteOnRestaurant = (restaurantId: string, voteNum: number) =>
    socket.addVote(sessionId, userId, restaurantId, voteNum);

  let search: ReactFragment = (
    <div className="flex-1 pt-4">
      <Search
        voteOnRestaurant={voteOnRestaurant}
        isAdded={isAdded}
        sessionId={sessionId}
        userId={userId}
        userState={userState}
        location={location}
        creatorName={creatorName}
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

  useEffect(() => {
    console.log(`updating isAdded.`);
    const newIsAdded: { [id: string]: boolean } = {};
    Object.keys(addedRestaurants).forEach(
      (restId) => (newIsAdded[restId] = true)
    );
    setIsAdded(newIsAdded);
    // console.log(`isAdded: ${JSON.stringify(isAdded)}`)
  }, [addedRestaurants]);

  useEffect(() => {
    if (!preAuthenticated && sessionId !== "") {
      socket.tryJoinSession({ sessionId, userId }, (response) => {
        console.log(
          `response from tryJoinSession is ${JSON.stringify(response)}`
        );
        if (response.success) {
          setSessionId(sessionId);
          setUserId(response.userId);
          setUserState(
            response.previouslyAuthenticated ? "canVote" : "canView"
          );
          setLocation(response.location);
          setCreatorName(response.creatorName);
          setAddedRestaurants(response.restaurants || {});
          setLoaded(true);
        } else {
          console.log("recieved failure from server");
        }
      });
    }
  }, [sessionId]);

  useEffect(() => {
    const sUserId = localStorage.getItem("chewUserId");
    if (sUserId) {
      setUserId(sUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log(`setting localStorage`);
      localStorage.setItem("chewUserId", userId);
    }
  }, [userId]);

  // useEffect(() => {
  //   (userCanVote = userState === "canVote"), [userState];
  // });
  // let history = useHistory();
  // const currentUrlMatch = matchPath<{sessionId?:string}>(history.location.pathname, 'sessionId');
  // console.log(currentUrlMatch?.params.sessionId)
  // console.log(history.location.pathname)
  // currentUrlMatch?.params.sessionId;

  return (
    <UserContextConsumer>
      {(context) => (
        <>
          <Toast show={showVotingToast}>
            <div className="p-2 pt-1 md:p-3 md:pt-2 bg-gray-100 flex items-center rounded-md">
              <FontAwesomeIcon
                icon={faBinoculars}
                className="flex-initial text-gray-800 p-1 pb-0"
                size="3x"
              />
              <div className="flex-1 pl-3">
                <div className="text-md font-bold border-b border-gray-400">
                  Currently in view-only mode.
                </div>
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
          </Toast>
          {loaded && context.userState !== "canVote" && !showVotingToast && (
            <ModalContainer>
              <UserNameModal escape={() => setShowVotingToast(true)} />
            </ModalContainer>
          )}
          <header className="bg-theme-red text-white shadow ">
            <nav className="flex justify-between p-1 lg:py-2 lg:px-4">
              <img
                className="text-white inline-block w-32 lg:w-40 flex-initial"
                src={Logo}
                alt="chew logo"
              />
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
                <FontAwesomeIcon icon={faUtensils} size="sm" className="mr-2" />
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
                    render={() => <Redirect to={`/ID/${context.sessionId}`} />}
                  />
                </Switch>
              )}
            />

            {/* SMALL DISPLAYS */}
            <Media
              query="(max-width: 767px)"
              render={() => (
                <Switch>
                  <Route path="/ID/:sessionId" exact render={() => display} />
                  <Route
                    path="/ID/:sessionId/search"
                    exact
                    render={() => search}
                  />
                </Switch>
              )}
            />
          </main>
          {/* {children} */}
          <Footer />
        </>
      )}
    </UserContextConsumer>
  );
};

export default AppTemplate;
