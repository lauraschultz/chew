import React from "react";

const LoginTemplate: React.FC = ({ children }) => {
  return (
    <div>
      <nav>
        <a href="/">restaurant chooser</a>
      </nav>

      {children}

      <footer>please star me on github</footer>
    </div>
  );
};

export default LoginTemplate;
