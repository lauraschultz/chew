import React, { useState } from "react";

const Toast: React.FC<{ show: boolean }> = ({show, children}) => {
  // let [show,setShow] = useState(false);
  return (
    <div
      className={
        "fixed z-50 right-0 bottom-0 m-3 shadow-xl transition-spacing duration-500 " +
        (show
          ? ""
          : "-mb-20")
      }
    >
      {children}
    </div>
  );
};

export default Toast;