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

export function TimeRangedRedditPostsFromSubreddit(subreddit: string, createdAfter: string, createdBefore: string) {
    let sort = "sort=desc"
    let sortType = "sort_type=created_utc"
    // let createdAfter = "after=1513588521"
    // let createdBefore = "before=1623934121"
    let size = "size=5"
    let url = "https://api.pushshift.io/reddit/search/submission/?subreddit="+subreddit+"&"+sort+"&"+sortType+"&"+createdAfter+"&"+createdBefore+"&"+size;

    let posts: RedditPost[] = [];

    return fetch(url)
        .then(resp => resp.json())
        .then(async data => {
            data = data.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].author === "[deleted]") continue;

                let response = await fetch(data[i].full_link+".json")
                let responseData = await response.json();
                let ops: Comment[] = [];
                for (let i = 0; i < responseData[1].data.children.length; i++) {
                    let comment = responseData[1].data.children[i].data;
                    if (comment.author === "[deleted]") continue;
                    ops[i] = {
                        comment: comment.body,
                        commentKarma: comment.score,
                        username: comment.author,
                        isCorrectAnswer: false,
                    }
                }

                ops.sort((a,b) => (a.commentKarma > b.commentKarma ? -1 : 1))
                ops = ops.slice(0, 3);
                ops[0].isCorrectAnswer = true;
                let shuffled = ops
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
                posts.push({
                    ID: data[i].id ?? "",
                    postKarma: data[i].score ?? 0,
                    postURL: data[i].full_link ?? "",
                    posterUsername: data[i].author ?? "",
                    comments: shuffled,
                    postBody: data[i].title,
                    postTitle: data[i].title ?? ""
                })
            }

            return posts;
        })
}

export function DecrementSurvivalLives(state: UserStateI) {
    return {
        authToken: state.userState.authToken,
        currentGame: {
            PostType: state.userState.currentGame!.PostType,
            Posts: state.userState.currentGame!.Posts,
            currentPostIndex: state.userState.currentGame!.currentPostIndex,
            numberCorrect: state.userState.currentGame!.numberCorrect ,
            survivalOptions: {
                lastPostIndex:  state.userState.currentGame!.survivalOptions!.lastPostIndex,
                remainingLives: state.userState.currentGame!.survivalOptions!.remainingLives - 1,
            }
        },
        email: state.userState.email,
        refreshToken: state.userState.refreshToken,
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
            survivalOptions: state.userState.currentGame!.survivalOptions
        },
        email: state.userState.email,
        refreshToken: state.userState.refreshToken,
        username: state.userState.username
    }
}