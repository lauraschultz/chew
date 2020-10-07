import React from "react";
import Footer from "../Footer";

const LoginTemplate: React.FC = ({ children }) => {
  return (
    <>
      <main className="flex-grow flex justify-center w-screen items-center">
        {children}
      </main>

      

      <Footer />
    </>
  );
};

export default LoginTemplate;
