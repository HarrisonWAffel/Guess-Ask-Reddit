import {Divider, Form, FormSelect, Grid, GridColumn, Header, Segment} from "semantic-ui-react";
import React, {FC, useState} from "react";
import {UserState, UserStateI} from "../App";
import {RedditPost, SurvivalOptions} from "./Game";
import {GetTopPostsFromSubreddit, TopPostEnum} from "../utils";

const options = [
    { key: '5', text: '5', value: 5 },
    { key: '10', text: '10', value: 10 },
    { key: '15', text: '15', value: 15 },
    { key: '-1', text: 'Survival', value: '-1' },
]

const NewGame:FC<UserStateI> = (props: UserStateI) => {
    const [postType, setPostType] = useState(TopPostEnum.NotSet);
    const [numberOfPosts, setNumberOfPosts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewGameButton, setShowNewGameButton] = useState(false);
    const [showPostCountSelector, setShowPostCountSelector] = useState(false);

    return <Form loading={isLoading} style={{margin: "auto"}}>
        <Segment>
            <Header as={"h2"}>Start New Game</Header>
            <Divider/>
            <Grid>
                <GridColumn width={8} textAlign={"center"} >
                <Form.Group  grouped widths={"equal"}>
                <Header as={"h3"} textAlign={"center"}>Post Type</Header>
                    <Form.Field
                        label='Most Popular All Time'
                        control='input'
                        type='radio'
                        name='htmlRadios'
                        onClick={()=>{
                            setPostType(TopPostEnum.AllTime)
                        }}
                    />
                    <Form.Field
                        label='Most Popular Past Month'
                        control='input'
                        type='radio'
                        name='htmlRadios'
                        onClick={()=>{
                            setPostType(TopPostEnum.PastMonth)
                        }}
                    />
                    <Form.Field
                        label='Most Popular Past Week'
                        control='input'
                        type='radio'
                        name='htmlRadios'
                        onClick={()=>{
                            setPostType(TopPostEnum.PastWeek)
                        }}
                    />
                    <Form.Field
                        label='Most Popular Past 24 Hours'
                        control='input'
                        type='radio'
                        name='htmlRadios'
                        onClick={()=>{
                            setPostType(TopPostEnum.PastDay);
                        }}
                    />
                </Form.Group>
                </GridColumn>
                <GridColumn width={8} textAlign={"center"}>
                    <Header as={"h3"}>Game Type</Header>
                    <Form.Group  inline={false} widths={"equal"}>
                        <Form.Field
                        label={"Limited Questions"}
                        control='input'
                        type={'radio'}
                        name='gameTypeRadios'
                        onClick ={()=>{
                            if (numberOfPosts === 0) {
                                setShowNewGameButton(false);
                            }
                            setShowPostCountSelector(true);
                        }}
                        />
                        <Form.Field
                            label={"Survival Mode"}
                            control='input'
                            type={'radio'}
                            name='gameTypeRadios'
                            onClick ={()=>{
                                setShowNewGameButton(true);
                                setShowPostCountSelector(false);
                            }}
                        />
                        <br/>
                    </Form.Group>
                    <div style={{marginLeft: "33%"}}>
                    <FormSelect  disabled={!showPostCountSelector} onChange={(e: any, data: any) => {
                        setNumberOfPosts(data.value);
                        setShowNewGameButton(true);
                    }} width={8} options={options} label={"Number of questions"}/>
                    </div>
                </GridColumn>
            </Grid>
            <Divider/>
        <Form.Button disabled={!showNewGameButton} onClick={async () => {
            setIsLoading(true);
            let postNum = numberOfPosts;
            let survivalMode: SurvivalOptions | null = null;
            if (numberOfPosts <= 0) {
                // survival mode
                survivalMode = {
                    lastPostIndex: 0,
                    remainingLives: 5
                }
                postNum = 10;
            }

            let posts: RedditPost[] = await GetTopPostsFromSubreddit({
                postFilter: postType,
                subreddit: "AskReddit",
                numberOfPosts: postNum,
                startingPostIndex: 0,
            })

            // adding a currentGame to the users state
            // will start the game.
            let userState: UserState = {
                authToken: props.userState.authToken,
                currentGame: {
                    PostType: postType,
                    Posts: posts,
                    currentPostIndex: 0,
                    numberCorrect: 0,
                    TotalPosts: posts.length,
                    survivalOptions: survivalMode,
                    isSurvival: survivalMode !== null,
                },
                email: props.userState.email,
                refreshToken: props.userState.refreshToken,
                username: props.userState.username
            }

            setIsLoading(false);
            props.setUserState(userState);
        }}>New Game</Form.Button>
        </Segment>
    </Form>
}

export default NewGame;