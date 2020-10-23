import React from "react";
import LoginFooter from "../LoginFooter";

const LoginTemplate: React.FC = ({ children }) => {
  return (
    <>
      <main className="flex-grow flex justify-center w-screen items-center">
        {children}
      </main>
      <LoginFooter />
    </>
  );
};

export default LoginTemplate;
