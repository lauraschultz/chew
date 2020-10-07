import React, { useState } from "react"

const Toast:React.FC<{show: boolean}> = (show, children) => {
    // let [show,setShow] = useState(false);
    return <div className={"absolute right-0 bottom-0 p-2 m-2 shadow-md transition durration-500 " + show ? "" : "-mb-12"}>
{children}
    </div>
}