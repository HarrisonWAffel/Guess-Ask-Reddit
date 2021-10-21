import React, {FC} from "react";
import {
    Button,
    Card,
    Container,
    Divider,
    Grid,
    GridColumn,
    GridRow,
    Message,
    Segment
} from "semantic-ui-react";
import {Comment} from "./Game";

interface GameOptionI {
    comment: Comment
    showCommentKarma: boolean
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const GameOption: FC<GameOptionI> = (x: GameOptionI) => {
    let pickme = <div></div>
    if (x.comment.isCorrectAnswer) {
        pickme = <div><p>PICK ME!</p></div>
    }

    return <div>
        <Message attached negative={
                    x.showCommentKarma && !x.comment.isCorrectAnswer
                }
                positive={
                    x.showCommentKarma && x.comment.isCorrectAnswer
                }>
            <Grid>
                <GridColumn width={12}>
                    <GridRow>
                        <Segment>
                            <Container text style={{whiteSpace: "pre-wrap"}}>
                                <h4><i>{x.comment.comment}</i></h4>
                                {pickme}
                            </Container>
                        </Segment>
                    </GridRow>
                </GridColumn>
                <GridColumn width={4}>
                    <GridRow>
                        <Card>
                            <Card.Content>
                                <Card.Header>{x.comment.username}</Card.Header>
                                <Card.Meta>Commenter</Card.Meta>
                            </Card.Content>
                            <Card.Content hidden={!x.showCommentKarma}>
                                <p>Karma: {x.comment.commentKarma}</p>
                            </Card.Content>
                        </Card>
                    </GridRow>
                </GridColumn>
            </Grid>
        </Message>
        <div hidden={x.showCommentKarma}>
            <Button attached={"bottom"} onClick={x.onClick}>Guess</Button>
        </div>
        <Divider/>
    </div>
}

export default GameOption;