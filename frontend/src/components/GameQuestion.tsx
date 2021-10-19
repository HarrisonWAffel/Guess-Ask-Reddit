import React, {FC} from "react";
import {
    Card,
    Container,
    Divider,
    Grid,
    GridColumn,
    GridRow,
    Header,
    Segment,
    SemanticWIDTHS
} from "semantic-ui-react";

interface GameQuestionI {
    rightGridWidth: SemanticWIDTHS
    leftGridWidth: SemanticWIDTHS
    question: string
    questionKarma: string
    OPUsername: string
    postURL: string
    currentScore: number
    survivalMode: boolean
    survivalLivesRemaining: number
}

const GameQuestion: FC<GameQuestionI> = (props: GameQuestionI) => {

    let score = <Header as={"h2"}>Current Score: {props.currentScore}</Header>
    if (props.survivalMode) {
        score = <div><Header as={"h2"}>Remaining Lives: {props.survivalLivesRemaining}</Header><Header as={"h2"}>Current Score: {props.currentScore}</Header></div>
    }

    return <div>
        <Container style={{height: "20vh", backgroundColor: "#665s1", borderRadius: "5px",}} fluid>
            <Grid style={{height: "100%"}} divided={true}>
                <GridColumn width={props.rightGridWidth}>
                    <GridRow>
                        <Segment style={{height:"100%"}} raised={true}>
                            <blockquote>
                                <h1><i>"{props.question}"</i></h1>
                            </blockquote>
                        </Segment>
                    </GridRow>
                </GridColumn>
                <GridColumn width={props.leftGridWidth}>
                    <GridRow>
                        <Card style={{height:"50%"}}>
                            <Card.Content>
                                <Card.Header>{props.OPUsername}</Card.Header>
                                <Card.Meta>OP</Card.Meta>
                                <Card.Meta>Post Karma: {props.questionKarma}</Card.Meta>
                            </Card.Content>
                        </Card>
                        {score}
                    </GridRow>
                </GridColumn>
            </Grid>
        </Container>
        <Divider/>
    </div>
}

export default  GameQuestion;

