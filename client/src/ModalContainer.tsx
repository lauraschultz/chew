import React from "react";
import { useClickOutsideListenerRef } from "./useClickOutsideListenerRef";

const ModalContainer: React.FC<{shadow: boolean}> = ({ shadow, children }) => {
  return (
      <div className="w-screen h-screen absolute bg-gray-800 bg-opacity-75 flex justify-center items-center z-40">
          <div className={"rounded max-w-sm m-2 " + (shadow ? "shadow-2xl" : "")}>
              {children}
          </div>
      </div>
    );
  
};

export default ModalContainer;
