import React from "react";
import {Comment, RedditPost} from "./components/Game";
import {UserState, UserStateI} from "./App";

export enum TopPostEnum {
    PastDay = "day",
    PastWeek = "week",
    PastMonth = "month",
    PastYear = "year",
    AllTime = "all",
    NotSet = "NOT SET"
}

export interface TopPostsFromSubreddit {
    postFilter: TopPostEnum
    subreddit: string
    numberOfPosts: number
    startingPostIndex: number | null
}
export interface NewTokens {
    authToken: string
    refreshToken: string
}

export async function RefreshToken(setUserState: React.Dispatch<React.SetStateAction<UserState>>): Promise<NewTokens>  {
    return HandleExpiredToken(setUserState)
}

export function GetBackendURL(): string {
    return process.env.REACT_APP_BACKEND_HOST+":"+process.env.REACT_APP_BACKEND_PORT;
}

export async function HandleExpiredToken(setUserState: React.Dispatch<React.SetStateAction<UserState>>): Promise<NewTokens>  {
    // refresh token
    let us = JSON.parse(localStorage.getItem("userState")!);
    return fetch("http://"+GetBackendURL()+"/refresh", {
        method: "POST",
        body: JSON.stringify({
            auth_token: us.authToken,
            refresh_token: us.refreshToken,
            username: us.username,
        })
    })
        .then(r => {
            if (!r.ok) {
                throw new Error("refresh token op failed")
            }
            return r.json()
        })
    .then(r => {
        setUserState({
            authToken: r.body.auth_token,
            currentGame: us.currentGame,
            refreshToken: r.body.refresh_token,
            username: us.username,
            expiry: r.body.expiry
        })
        let x: NewTokens = {
            authToken: r.body.auth_token,
            refreshToken: r.body.refresh_token
        }
        return x
    })
}

export function GetTopPostsFromSubreddit(options: TopPostsFromSubreddit) {
    let limit = options.numberOfPosts.toString()
    if (options.startingPostIndex !== null) {
        limit = (options.numberOfPosts + options.startingPostIndex).toString()
    }
    let url = "https://www.reddit.com/r/"+options.subreddit+"/top/.json?sort=top&t="+options.postFilter+"&limit="+limit;
    return fetch(url)
        .then(resp => resp.json())
        .then(async data => {
            let i = 0;
            if (options.startingPostIndex !== null) {
                i = options.startingPostIndex!
            }
            let posts: RedditPost[] = []
            let allPosts = data.data.children;
            for (; i < allPosts.length; i++) {
                if (allPosts[i].author === "[deleted]") continue;
                let p: RedditPost = {
                    ID: allPosts[i].data.id,
                    comments: [],
                    postBody: "",
                    postKarma: allPosts[i].data.score,
                    postTitle: allPosts[i].data.title,
                    postURL: allPosts[i].data.url,
                    posterUsername: allPosts[i].data.author
                }
                p.comments = await getCommentsForPost(p)
                posts.push(p);
            }
            return posts;
        })
}

async function getCommentsForPost(p: RedditPost) {
    let response = await fetch(p.postURL + "/.json").then(resp => resp.json()) // get post comments
    response = response[1].data.children;
    let comments: Comment[] = []
    for(let j = 0; j < response.length; j++) {
        if (response[j].data.body === "[deleted]") continue;
        let c: Comment = {
            comment: response[j].data.body,
            commentKarma: response[j].data.score,
            username: response[j].data.author,
            isCorrectAnswer: false,
        }
        comments.push(c)
    }
    comments.sort((a,b)=> a.commentKarma > b.commentKarma ? -1 : 1) // sort comments by karma
    comments = comments.slice(0, 3) // take top three posts
    comments[0].isCorrectAnswer = true;
    comments = comments // shuffle top three posts
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    return comments;
}

export function DecrementSurvivalLives(state: UserStateI) {
    return {
        authToken: state.userState.authToken,
        currentGame: {
            PostType: state.userState.currentGame!.PostType,
            Posts: state.userState.currentGame!.Posts,
            currentPostIndex: state.userState.currentGame!.currentPostIndex,
            numberCorrect: state.userState.currentGame!.numberCorrect ,
            TotalPosts: state.userState.currentGame!.TotalPosts,
            survivalOptions: {
                lastPostIndex:  state.userState.currentGame!.survivalOptions!.lastPostIndex,
                remainingLives: state.userState.currentGame!.survivalOptions!.remainingLives - 1,
            },
            isSurvival: state.userState.currentGame!.isSurvival,
        },
        refreshToken: state.userState.refreshToken,
        expiry: state.userState.expiry,
        username: state.userState.username
    }
}

export function IncrementScore(state: UserStateI) {
    return {
        authToken: state.userState.authToken,
        currentGame: {
            PostType: state.userState.currentGame!.PostType,
            Posts: state.userState.currentGame!.Posts,
            currentPostIndex: state.userState.currentGame!.currentPostIndex,
            numberCorrect: state.userState.currentGame!.numberCorrect + 1,
            survivalOptions: state.userState.currentGame!.survivalOptions,
            TotalPosts: state.userState.currentGame!.TotalPosts,
            isSurvival: state.userState.currentGame!.isSurvival,
        },
        refreshToken: state.userState.refreshToken,
        expiry: state.userState.expiry,
        username: state.userState.username
    }
}