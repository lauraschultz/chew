import {
  faCopyright,
  faDoorOpen,
  faFileSignature,
  faSearch,
  faStar,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactFragment } from "react";
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

interface Props extends RouteComponentProps<{ sessionId: string }> {
  search: ReactFragment;
  display: ReactFragment;
}

const AppTemplate: React.FC<Props> = ({ children, match, display, search }) => {
  console.log(`match!! ${JSON.stringify(match)}`);
  // let history = useHistory();
  // const currentUrlMatch = matchPath<{sessionId?:string}>(history.location.pathname, 'sessionId');
  // console.log(currentUrlMatch?.params.sessionId)
  // console.log(history.location.pathname)
  // currentUrlMatch?.params.sessionId;

  return (
    <div className="bg-theme-light font-body h-screen w-screen text-theme-dark-gray overflow-y-scroll">
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
            to={`/ID/${match.params.sessionId}`}
            exact={true}
            className="p-1 m-1"
            activeClassName="border-b-2 border-white"
          >
            <FontAwesomeIcon icon={faUtensils} size="sm" className="mr-2" />
            view restaurants
          </NavLink>
          <NavLink
            to={`/ID/${match.params.sessionId}/search`}
            exact={true}
            className="p-1 m-1"
            activeClassName="border-b-2 border-white"
          >
            <FontAwesomeIcon icon={faSearch} size="sm" className="mr-2" />
            search
          </NavLink>
        </div>
      </header>

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
              render={() => <Redirect to={`/ID/${match.params.sessionId}"`} />}
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

      {/* {children} */}

      <footer className="text-theme-red">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="currentColor"
            fill-opacity="1"
            d="M0,256L34.3,234.7C68.6,213,137,171,206,138.7C274.3,107,343,85,411,96C480,107,549,149,617,186.7C685.7,224,754,256,823,245.3C891.4,235,960,181,1029,176C1097.1,171,1166,213,1234,208C1302.9,203,1371,149,1406,122.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
          ></path>
        </svg>
        <div className="bg-theme-red text-white px-2 md:px-8 lg:p-24 pb-6 flex justify-around leading-tight">
          <div className="flex-1">
            <p>
              <FontAwesomeIcon icon={faCopyright} size="sm" className="mr-2" />
              <a href="" target="_blank">
                Laura Schultz
              </a>{" "}
              2020
            </p>
            <a
              className="block"
              href="http://github.com/lauraschultz/chew"
              target="_blank"
            >
              <FontAwesomeIcon icon={faStar} size="sm" className="mr-2" />
              star on Github
            </a>
          </div>
          <div className="flex-1">
            <a className="block">
              <FontAwesomeIcon
                icon={faFileSignature}
                size="sm"
                className="mr-2"
              />
              terms of use & privacy policy
            </a>
          </div>

          {/* <Link to="">show restaurants</Link>
          <Link to="">show search</Link> */}
        </div>
      </footer>
    </div>
  );
};

export default AppTemplate;
