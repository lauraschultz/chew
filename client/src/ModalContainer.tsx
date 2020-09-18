import React from "react";

const ModalContainer: React.FC<{ show: boolean }> = ({ show, children }) => {
  if (show) {
    return (
      <div className="w-screen h-screen absolute bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg">
              {children}
          </div>
      </div>
    );
  }
  return null;
};

export default ModalContainer;
