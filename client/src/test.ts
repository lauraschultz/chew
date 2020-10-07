import React, { useState } from "react"

export function useNumber() {
    let [num, setNum] = useState(1);
    setTimeout(() => setNum(2), 3000)
    return {num, setNum};
}

