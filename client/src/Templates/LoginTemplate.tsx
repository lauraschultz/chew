import React from "react";
import AppFooter from "../AppFooter";

const LoginTemplate: React.FC = ({ children }) => {
  return (
    <>
      <main className="flex-grow flex justify-center w-screen items-center">
        {children}
      </main>

      

      {/* <AppFooter /> */}
    </>
  );
};

export default LoginTemplate;
