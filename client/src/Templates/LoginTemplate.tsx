import React from "react";

const LoginTemplate: React.FC = ({ children }) => {
  return (
    <>
      <nav>
        <a href="/">restaurant chooser</a>
      </nav>

      {children}

      <footer>please star me on github</footer>
    </>
  );
};

export default LoginTemplate;
