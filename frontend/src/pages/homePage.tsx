import React, {FC, useState} from "react";
import {UserStateI} from "../App";

import {
    Button, CommentText,
    Container, Grid, GridColumn, GridRow,
    Header,
    Segment
} from "semantic-ui-react";

import GameView from "../components/GameView";

const HomePage: FC<UserStateI> = ({setUserState, userState}) => {


    let about = <Segment>
        <Container text fluid={true}>
            <Segment>
                <Header as={"h2"} style={{margin: "auto"}}>What is "Guess Ask Reddit"?</Header>
                <br/>
                <i>"Guess Ask Reddit"</i> Is a small online game that presents posts
                from r/AskReddit and asks you to guess what comment has the highest karma.
                <br/><br/>
                How deeply in-sync are you with the reddit hive-mind? Play and find out!
            </Segment>
        </Container>
    </Segment>

    if (userState.currentGame !== null) {
        about = <div></div>
    }

    return (
        <div>
            <Container>
                <br/>
                <Header as={"h2"} style={{marginLeft: "7.5em"}}>
                    Guess Ask Reddit
                    <div  style={{float: "right"}}>
                        <p style={{display: "inline"}}> {userState.username}  </p>
                        <Button onClick={()=>{
                            localStorage.clear();
                            setUserState({
                                username: "",
                                email: "NOT LOGGED IN",
                                authToken:"",
                                refreshToken:"",
                                currentGame: null
                            })}
                        }>log out</Button>
                    </div>
                </Header>
            </Container>
        <Container style={{ marginTop: '3.25vh', marginBottom: '2vh', position: "relative", height: "fit-content"}} >
        {about}
        <Segment style={{height: `fit-content`}}>
            <GameView
                userState={userState}
                setUserState={setUserState}
            />
            </Segment>
            </Container>
            <Container>
                <Segment>
                    <Header as={"h1"}>Leaderboards</Header>
                </Segment>
            </Container>
        </div>
    );
}

export default HomePage;