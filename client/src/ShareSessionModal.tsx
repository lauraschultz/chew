import React from "react";
import ModalWelcomeHeader from "./ModalWelcomeHeader";
import { useClickOutsideListenerRef } from "./useClickOutsideListenerRef";
import CopySessionUrl from "./CopySessionUrl";

const ShareSessionModal: React.FC<{ escape: () => void }> = ({ escape }) => {
  let ref = useClickOutsideListenerRef(escape);

  return (
    <>
      <ModalWelcomeHeader escape={escape} />
      <div ref={ref} className="pt-1 pb-3 px-4 rounded-b bg-white text-gray-700">
        Share this url with others:
        <div className="mt-1 mb-4 mx-auto w-max-content">
          <CopySessionUrl
            buttonThemes="bg-green-500 border-green-500 text-white"
            buttonShadowColor="white"
            inputThemes="border-gray-400"
          />
        </div>
        <button
          onClick={escape}
          className="py-1 uppercase tracking-wide text-sm border border-gray-700 w-full mt-2 rounded shadow font-bold btn-focus"
        >
          dismiss
        </button>
      </div>
    </>
  );
};

export default ShareSessionModal;
