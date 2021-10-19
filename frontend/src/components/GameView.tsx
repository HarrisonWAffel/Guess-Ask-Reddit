import Game from "./Game";
import NewGame from "./newGame";
import {UserStateI} from "../App";
import React, {FC, useState} from "react";
import {TopPostEnum} from "../utils";

const GameView: FC<UserStateI> = (props: UserStateI) => {
    const [postType, setPostType] = useState(TopPostEnum.PastDay);
    const [numberOfPosts, setNumberOfPosts] = useState(0);

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