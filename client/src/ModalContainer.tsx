import React from "react";

const ModalContainer: React.FC<{ show: boolean }> = ({ show, children }) => {
  if (show) {
    return (
      <div className="w-screen h-screen absolute bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="rounded shadow-2xl">
              {children}
          </div>
      </div>
    );
  }
  return null;
};

export default ModalContainer;
