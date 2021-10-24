import Game from "./Game";
import NewGame from "./newGame";
import {UserStateI} from "../App";
import React, {FC} from "react";

const GameView: FC<UserStateI> = (props: UserStateI) => {
    if (props.userState.currentGame != null) {
        return <Game userState={props.userState}
                     setUserState={props.setUserState}
        />
    } else {
        return <NewGame
            userState={props.userState}
            setUserState={props.setUserState}
        />
    }
}

export default GameView;