import {FC, useEffect, useState} from "react";
import {Segment, Table, Header, Button} from "semantic-ui-react";
import {RedditPost} from "./Game";
import {UserStateI} from "../App";
import {GetLeaderboard} from "../utils";

declare interface LeaderboardResponse {
    id: string;
    time: string;
    username: string;
    mode: string;
    number_of_questions: number;
    score: number;
    posts: RedditPost[];
}

const SurvivalLeaderboard: LeaderboardResponse[] = [];
const NormalLeaderBoard: LeaderboardResponse[] = [];

const LeaderboardView: FC<UserStateI> = (state: UserStateI) => {
    const [survivalModeTableIsLoading, setSurvivalModeTableIsLoading] = useState(false);
    const [normalModeTableIsLoading, setNormalModeTableIsLoading] = useState(false);
    const [survivalLeaderboard, setSurvivalLeaderBoard] = useState(SurvivalLeaderboard)
    const [normalLeaderboard, setNormalLeaderBoard] = useState(NormalLeaderBoard)

    useEffect(()=>{
        if (survivalLeaderboard.length === 0) {
            refreshLeaderBoard("survival")
        }
        if (normalLeaderboard.length === 0) {
            refreshLeaderBoard("normal")
        }
    }, [])

    function refreshLeaderBoard(type: string) {
        switch (type) {
            case "survival":
                setSurvivalModeTableIsLoading(true);
                GetLeaderboard("survival", state.userState.authToken).then(r => r.json())
                    .then(r => {
                        let body = JSON.parse(r.body);
                        if (body == null || body.length === 0) {
                            let noResultsItem:LeaderboardResponse = {
                                id: "", mode: "survival", number_of_questions: 0, posts: [], score: 0, time: "", username: "No Results, be the first!"
                            }
                            setSurvivalLeaderBoard([noResultsItem]);
                        } else {
                            body.sort((a: LeaderboardResponse, b: LeaderboardResponse) => (a.score > b.score) ? -1 : 1)
                            setSurvivalLeaderBoard(body);
                        }
                        setSurvivalModeTableIsLoading(false);
                    })
                break;
            default:
                GetLeaderboard("limited", state.userState.authToken).then(r => r.json())
                    .then(r => {
                        let body = JSON.parse(r.body);
                        if (body == null || body.length === 0) {
                            let noResultsItem:LeaderboardResponse = {
                                id: "", mode: "limited", number_of_questions: 0, posts: [], score: 0, time: "", username: "No Results, be the first!"
                            }
                            setNormalLeaderBoard([noResultsItem]);
                        } else {
                            body.sort((a: LeaderboardResponse, b: LeaderboardResponse) => (a.score > b.score) ? -1 : 1)
                            setNormalLeaderBoard(body);
                        }
                        setNormalModeTableIsLoading(false);
                    })
        }
    }

    return <div>
        <Segment loading={survivalModeTableIsLoading}>
            <Header style={{display: "inline"}} as={"h2"}> Survival Mode</Header>
            <Button style={{float: "right", display: "inline"}} icon={"sync alternate"} onClick={()=>{refreshLeaderBoard("survival")}}/>
            <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Username</Table.HeaderCell>
                    <Table.HeaderCell>Number Of Posts</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    survivalLeaderboard.map((obj, id) => {
                        return <Table.Row>
                            <Table.Cell>
                                {obj.username}
                            </Table.Cell>
                            <Table.Cell>{obj.posts.length}</Table.Cell>
                            <Table.Cell>{obj.score}</Table.Cell>
                        </Table.Row>
                    })
                }
            </Table.Body>
            </Table>
        </Segment>
        <Segment loading={normalModeTableIsLoading}>
            <Header style={{display: "inline"}} as={"h2"}>Normal Mode</Header>
            <Button style={{float: "right", display: "inline"}} icon={"sync alternate"} onClick={()=>{refreshLeaderBoard("")}}/>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Username</Table.HeaderCell>
                        <Table.HeaderCell>Number Of Posts</Table.HeaderCell>
                        <Table.HeaderCell>Score</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        normalLeaderboard.map((obj, id) => {
                            return <Table.Row>
                                <Table.Cell>
                                    {obj.username}
                                </Table.Cell>
                                <Table.Cell>{obj.posts.length}</Table.Cell>
                                <Table.Cell>{obj.score}</Table.Cell>
                            </Table.Row>
                        })
                    }
                </Table.Body>
            </Table>
        </Segment>
    </div>
}



export default LeaderboardView;