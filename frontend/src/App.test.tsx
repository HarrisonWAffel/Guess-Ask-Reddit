import React from 'react';
import {GetTopPostsFromSubreddit, TopPostEnum} from "./utils";
import {RedditPost} from "./components/Game";

jest.setTimeout(10000000)
test('survival mode gets unique posts', async () => {
  let posts: RedditPost[] = await GetTopPostsFromSubreddit({
    postFilter: TopPostEnum.PastDay,
    subreddit: "AskReddit",
    numberOfPosts: 5,
    startingPostIndex: 0,
  })

  let posts2: RedditPost[] = await GetTopPostsFromSubreddit({
    postFilter: TopPostEnum.PastDay,
    subreddit: "AskReddit",
    numberOfPosts: 5,
    startingPostIndex: 5,
  })

  let samepostcount = 0;
  for (let i = 0; i < posts.length; i++) {
    for (let j = 0; j < posts2.length; j++) {
      if (posts[i].postURL === posts2[j].postURL) {
        samepostcount++;
      }
    }
  }
  expect(samepostcount).toEqual(0);
});
