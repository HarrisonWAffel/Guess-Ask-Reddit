import React, {FC, useEffect, useState} from "react";
import {Button, Header, Segment} from "semantic-ui-react";

import GameOption from "./GameOption";
import GameQuestion from "./GameQuestion";
import {UserStateI} from "../App";
import {DecrementSurvivalLives, GetTopPostsFromSubreddit, IncrementScore, TopPostEnum} from "../utils";

export interface SurvivalOptions {
    lastPostIndex: number
    remainingLives: number
}

export interface GameI {
    PostType: TopPostEnum
    numberCorrect: number
    currentPostIndex: number
    Posts: RedditPost[]
    survivalOptions: SurvivalOptions | null
    isSurvival: boolean
}

export interface Comment {
    username: string
    comment: string
    commentKarma: number
    isCorrectAnswer: boolean
}

export interface RedditPost {
    ID: string
    posterUsername: string
    postKarma: number
    postURL: string
    postTitle: string
    postBody: string
    comments: Comment[]
}

const Game: FC<UserStateI> = (state: UserStateI) => {
    let currentPost = state.userState.currentGame!.Posts[state.userState.currentGame!.currentPostIndex];
    const [showKarma, setShowKarma] = useState((JSON.parse(localStorage.getItem("showKarma") as string) || false))
    const [guessed, setGuessed] = useState((JSON.parse(localStorage.getItem("guessed") as string) || false))
    const [isLoading, setIsLoading] = useState(false);
    const [nextButtonText, setNextButtonText] = useState("NEXT QUESTION");

    useEffect(()=> {
        localStorage.setItem("guessed", JSON.stringify(guessed))
        localStorage.setItem("showKarma", JSON.stringify(showKarma))
    })

    function nextQ() {
        state.setUserState({
            authToken: state.userState.authToken,
            currentGame: {
                PostType: state.userState.currentGame!.PostType,
                Posts: state.userState.currentGame!.Posts,
                currentPostIndex: state.userState.currentGame!.currentPostIndex + 1,
                numberCorrect: state.userState.currentGame!.numberCorrect,
                survivalOptions: state.userState.currentGame!.survivalOptions,
                isSurvival: state.userState.currentGame!.isSurvival,
            },
            email: state.userState.email,
            refreshToken: state.userState.refreshToken,
            username: state.userState.username
        });
        setShowKarma(false);
        setGuessed(false);
    }

    async function GetMorePostsForSurvivalMode() {
        setIsLoading(true);
        let newPostIndex = state.userState.currentGame!.survivalOptions!.lastPostIndex + 5;
        // get some more posts for survival mode
        let posts: RedditPost[] = await GetTopPostsFromSubreddit({
            postFilter: state.userState.currentGame!.PostType,
            subreddit: "AskReddit",
            numberOfPosts: state.userState.currentGame!.Posts.length,
            startingPostIndex: newPostIndex,
        })
        // go to the first post in the newly generated
        // list of posts
        state.setUserState({
            authToken: state.userState.authToken,
            currentGame: {
                PostType: state.userState.currentGame!.PostType,
                Posts: posts,
                currentPostIndex: 0,
                numberCorrect: state.userState.currentGame!.numberCorrect,
                survivalOptions: {
                    lastPostIndex: newPostIndex,
                    remainingLives: state.userState.currentGame!.survivalOptions!.remainingLives,
                },
                isSurvival: state.userState.currentGame!.isSurvival,
            },
            email: state.userState.email,
            refreshToken: state.userState.refreshToken,
            username: state.userState.username
        });
        setIsLoading(false);
        setShowKarma(false);
        setGuessed(false);
    }

    function endgame() {

        // report game result to
        // the backend for leaderboards
        fetch("http://localhost:1337/submit", {
            method: "POST",
            body: JSON.stringify(state.userState.currentGame!),
            headers: {
                "authToken": state.userState.authToken,
                "gameMode": state.userState.currentGame!.survivalOptions !== null ? "survival" : "limited"
            }
        }).catch(err => {
            alert(err);
        })

        state.setUserState({
            authToken: state.userState.authToken,
            currentGame: null,
            email: state.userState.email,
            refreshToken: state.userState.refreshToken,
            username: state.userState.username
        });

        localStorage.removeItem("guessed")
        localStorage.removeItem("showKarma")
    }

    return <Segment style={{height: "fit-content"}} loading={isLoading}>
        <GameQuestion rightGridWidth={12} leftGridWidth={4}
                      question={currentPost?.postTitle ?? ""}
                      questionKarma={currentPost?.postKarma.toString() ?? ""}
                      OPUsername={currentPost?.posterUsername ?? ""}
                      postURL={currentPost?.postURL ?? ""}
                      currentScore={state.userState.currentGame!.numberCorrect}
                      survivalMode={state.userState.currentGame!.survivalOptions !== null}
                      survivalLivesRemaining={state.userState.currentGame!.survivalOptions?.remainingLives ?? 0}/>

        {
            currentPost.comments.map((obj) => {
                return <GameOption
                    comment={obj}
                    showCommentKarma={showKarma}
                    onClick={()=>{
                        //todo; needs to persist across refreshes
                        if (guessed) return; // can't guess twice on one question
                        setShowKarma(true);
                        if (state.userState.currentGame!.survivalOptions === null) {
                            if (obj.isCorrectAnswer) {
                                state.setUserState(IncrementScore(state));
                            }
                        } else {
                            if (!obj.isCorrectAnswer) {
                                let s = DecrementSurvivalLives(state)
                                if (s.currentGame!.survivalOptions!.remainingLives <= 0) {
                                    setNextButtonText("END GAME - NO MORE LIVES")
                                }
                                state.setUserState(s);
                            } else {
                                state.setUserState(IncrementScore(state));
                            }
                        }
                        setGuessed(true);
                    }}
                />
            })
        }

        <Button disabled={!showKarma} style={{marginRight: "2em"}} onClick={()=>{
            window.open(currentPost.postURL, '_blank')?.focus();
        }}>Show Post On Reddit</Button>

        <Button disabled={!showKarma} onClick={async () => {
            if (state.userState.currentGame!.currentPostIndex + 1 >= state.userState.currentGame!.Posts.length) { // if the next post index is out of bounds we have run out of posts
                if (state.userState.currentGame!.survivalOptions !== null) {
                    await GetMorePostsForSurvivalMode(); // if we are playing survival mode we just need more posts
                } else {
                   endgame(); // non-survival mode ran out of questions, game over
                }
            } else {
                if (state.userState.currentGame!.survivalOptions !== null) {
                    if (nextButtonText === "END GAME - NO MORE LIVES") {
                        endgame() // survival mode ran out of lives, game over
                        return;
                    }
                }
                nextQ();
            }
        }}>{nextButtonText}</Button>

        <Header as={"h4"}> Q: {state.userState.currentGame!.currentPostIndex+1}/{state.userState.currentGame!.Posts.length} </Header>
    </Segment>
}

export default Game;