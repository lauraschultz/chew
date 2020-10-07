import {
  faCopyright,
  faDoorOpen,
  faFileSignature,
  faSearch,
  faStar,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, ReactFragment, useEffect, useState } from "react";
import Media from "react-media";
import {
  Link,
  matchPath,
  NavLink,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import Logo from "../assets/chew_logo.svg";
import { useAddedRestaurants, useUserData } from "../customHooks";
import Footer from "../Footer";
import ModalContainer from "../ModalContainer";
// import { setUserName } from "../socket";
import socket from "../socket";

interface Props extends RouteComponentProps<{ sessionId: string }> {
  search: ReactFragment;
  display: ReactFragment;
}

const UserNameModal: React.FC = () => {
  let [currentUserName, setCurrentUserName] = useState("");
  let { sessionId, userId, setUserState } = useUserData();
  return (
    <>
      <div className="py-2 px-3 text-white bg-gradient-to-r from-theme-red to-theme-dark-red rounded-t font-bold text-xl">
        <span className="">Welcome to</span>
        <img className="inline w-24 ml-1" src={Logo} />
      </div>
      <form
        className="pb-3 px-4 rounded-b bg-white text-gray-800"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if(userId){
            socket.setUserName(
            { sessionId, userId, userName: currentUserName },
            (response) => {
              console.log(`result of setting name: ${response.success}`);
              if (response.success) {
                setUserState("canVote");
              }
            }
          );
          }
          
        }}
      >
        <div className="uppercase tracking-wide text-gray-600 text-xs pt-1 pb-4">
          invited to AAA's session by BBB
        </div>
        <label>
          your name:
          <input
            value={currentUserName}
            type="text"
            onChange={(e) => setCurrentUserName(e.target.value)}
            className="border-b-2 border-gray-600 px-1 ml-2"
          />
        </label>
        <button
          type="submit"
          className="py-1 px-1 uppercase tracking-wide text-sm text-white bg-theme-yellow block w-full mt-4 rounded shadow font-bold"
        >
          done
        </button>
      </form>
    </>
  );
};

const AppTemplate: React.FC<Props> = ({ location, display, search }) => {
  let {
    userState,
    setUserState,
    sessionId,
    setSessionId,
    userId,
    setUserId,
  } = useUserData();
  let loaded = false;
  // let [localUserState, setLocalUserState]= useState<string>("canView");
  let { setAddedRestaurants } = useAddedRestaurants();
  useEffect(() => {
    // console.log(`history state is ${JSON.stringify(history.state)}`)
    // if (userState === "canView") {
      console.log(`userState is ${userState}, trying to join session.`);
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
    return () => {loaded = true}
  }, [sessionId]);

  // useEffect(() => {
  //   (userCanVote = userState === "canVote"), [userState];
  // });
  // let history = useHistory();
  // const currentUrlMatch = matchPath<{sessionId?:string}>(history.location.pathname, 'sessionId');
  // console.log(currentUrlMatch?.params.sessionId)
  // console.log(history.location.pathname)
  // currentUrlMatch?.params.sessionId;

  return (
    <>
      {loaded && userState !== "canVote" && (
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
            to={`/ID/${sessionId}`}
            exact={true}
            className="p-1 m-1"
            activeClassName="border-b-2 border-white"
          >
            <FontAwesomeIcon icon={faUtensils} size="sm" className="mr-2" />
            view restaurants
          </NavLink>
          <NavLink
            to={`/ID/${sessionId}/search`}
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
                render={() => <Redirect to={`/ID/${sessionId}"`} />}
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
              <Route path="/ID/:sessionId/search" exact render={() => search} />
            </Switch>
          )}
        />
      </main>

      {/* {children} */}

      <Footer />
    </>
  );
};

export default AppTemplate;
