import React, {FC} from "react";
import {UserStateI} from "../App";

import {
    Button, Container, Header,
    Segment
} from "semantic-ui-react";

import GameView from "../components/GameView";
import LeaderboardView from "../components/LeaderboardView";
import About from "../components/About";

const HomePage: FC<UserStateI> = ({setUserState, userState}) => {


    let about = <div></div>
    if (userState.currentGame === null) {
        about = <About/>
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
                            fetch("http://localhost:1337/logout", {
                                method: "POST",
                                headers: {
                                    "authToken": userState.authToken,
                                },
                                body: JSON.stringify({
                                    username: userState.username,
                                })
                            })

                            localStorage.clear();
                            setUserState({
                                username: "",
                                authToken:"",
                                refreshToken:"",
                                expiry: "",
                                currentGame: null
                            })

                        }}>log out</Button>
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
                    <LeaderboardView userState={userState} setUserState={setUserState}/>
                </Segment>
            </Container>
        </div>
    );
}

export default HomePage;