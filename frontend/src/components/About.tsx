import {Container, Header, Segment} from "semantic-ui-react";
import React from "react";

const About = () => {
    return <Segment>
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
}

export default About;