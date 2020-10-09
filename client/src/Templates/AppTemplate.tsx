import {
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
    setUserState,
  } = useContext(UserContext);
  let [isAdded, setIsAdded] = useState<{ [id: string]: boolean }>({});
  let [loaded, setLoaded] = useState(false);
  // let loaded = false;

  useEffect(() => {
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
          setAddedRestaurants(response.restaurants || {});
          // history.push(`/ID/${match.params.sessionId}`);
        } else {
          console.log("recieved failure from server");
        }
      });
      //else redirect?????
      // }
      // return () => {
      //   console.log(`loaded is true.`)
      //   setLoaded(true);
      // };
      setLoaded(true);
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
          {loaded && context.userState !== "canVote" && (
            <ModalContainer>
              <UserNameModal />
            </ModalContainer>
          )}
          <header className="bg-theme-red text-white shadow ">
            <nav className="flex justify-between p-1 lg:p-3">
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
                    render={() => <Redirect to={`/ID/${context.sessionId}"`} />}
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
