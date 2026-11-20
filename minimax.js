const ORION_ACTIONS = [

    {
        name: "ЭНЕРГИЯНЫ ҮНЕМДЕУ",
        effect: "energy",
        value: 8
    },

    {
        name: "ЖОЛДЫ БҰҒАТТАУ",
        effect: "fuel",
        value: 10
    },

    {
        name: "СИГНАЛДЫ КҮШЕЙТУ",
        effect: "signal",
        value: 12
    },

    {
        name: "ЖАЛҒАН СИГНАЛ",
        effect: "confusion",
        value: 7
    }

];


function evaluateState(state) {

    let score = 0;

    score += state.energy * 0.3;
    score += state.fuel * 0.2;
    score += state.signal * 0.4;

    if (state.confusion) {
        score += 10;
    }

    return score;
}


function applyAction(state, action) {

    const newState = {
        ...state
    };


    if (action.effect === "energy") {

        newState.energy =
            Math.min(
                100,
                newState.energy + action.value
            );

    }


    if (action.effect === "fuel") {

        newState.fuel =
            Math.max(
                0,
                newState.fuel - action.value
            );

    }


    if (action.effect === "signal") {

        newState.signal =
            Math.min(
                100,
                newState.signal + action.value
            );

    }


    if (action.effect === "confusion") {

        newState.confusion = true;

    }


    return newState;
}


function minimax(
    state,
    depth,
    maximizingPlayer,
    alpha,
    beta
) {

    if (depth === 0) {
        return evaluateState(state);
    }


    if (maximizingPlayer) {

        let maxEval = -Infinity;


        for (const action of ORION_ACTIONS) {

            const newState =
                applyAction(state, action);


            const evaluation =
                minimax(
                    newState,
                    depth - 1,
                    false,
                    alpha,
                    beta
                );


            maxEval =
                Math.max(
                    maxEval,
                    evaluation
                );


            alpha =
                Math.max(
                    alpha,
                    evaluation
                );


            if (beta <= alpha) {
                break;
            }

        }


        return maxEval;

    }


    else {

        let minEval = Infinity;


        for (const action of ORION_ACTIONS) {

            const newState =
                applyAction(state, action);


            const evaluation =
                minimax(
                    newState,
                    depth - 1,
                    true,
                    alpha,
                    beta
                );


            minEval =
                Math.min(
                    minEval,
                    evaluation
                );


            beta =
                Math.min(
                    beta,
                    evaluation
                );


            if (beta <= alpha) {
                break;
            }

        }


        return minEval;

    }

}


function getOrionDecision(gameState) {

    let bestAction = null;

    let bestScore = -Infinity;


    for (const action of ORION_ACTIONS) {

        const newState =
            applyAction(
                gameState,
                action
            );


        const score =
            minimax(
                newState,
                2,
                false,
                -Infinity,
                Infinity
            );


        if (score > bestScore) {

            bestScore = score;
            bestAction = action;

        }

    }


    return {
        action: bestAction,
        score: bestScore
    };

}