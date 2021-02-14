import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Login from "./Login";
import LoginTemplate from "./Templates/LoginTemplate";
import "./comp.css";
import { UserContextProvider } from "./UserDataContext";
import FourOhFour from "./404";
import TOS from "./TOS";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalContainer from "./ModalContainer";
require("dotenv").config();
const AppTemplate = React.lazy(() => import("./Templates/AppTemplate"));

const App: React.FC = () => (
	<UserContextProvider>
		<Switch>
			<Route path="/getStarted" exact>
				<LoginTemplate>
					<Login />
				</LoginTemplate>
			</Route>
			<Route
				path="/ID/:sessionId"
				render={() => (
					<Suspense
						fallback={
							<ModalContainer shadow={false} onClose={() => {}}>
								<FontAwesomeIcon
									icon={faCircleNotch}
									size="5x"
									className="animate-spin text-yellow block"
								/>
							</ModalContainer>
						}
					>
						<AppTemplate />
					</Suspense>
				)}
			></Route>
			<Route path="/404" exact>
				<FourOhFour />
			</Route>
			<Route path="/TOS" exact>
				<TOS />
			</Route>
			<Route path="/" exact>
				<Redirect to="/getStarted" />
			</Route>
			<Route path="/">
				<Redirect to="/404" />
			</Route>
		</Switch>
	</UserContextProvider>
);

export default App;
