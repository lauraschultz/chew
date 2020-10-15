import React from "react";

const ModalContainer: React.FC = ({ children }) => {
  return (
      <div className="w-screen h-screen absolute bg-gray-800 bg-opacity-75 flex justify-center items-center z-40">
          <div className="rounded shadow-2xl max-w-sm m-2">
              {children}
          </div>
      </div>
    );
  
};

export default ModalContainer;
