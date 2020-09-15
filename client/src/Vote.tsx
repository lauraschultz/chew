import React from 'react';

const Vote: React.FC<{addVote: Function}> = ({addVote}) => {
    return (<div>
        <p>add your vote:</p>
        <button onClick={() => addVote(2)}>:)</button>
        <button onClick={() => addVote(1)}>:|</button>
        <button onClick={() => addVote(0)}>:(</button>
    </div>)
}

export default Vote;