import React, {FC, useState} from "react";
import {Button, Form, Header, Icon, Input, Message, Segment} from "semantic-ui-react";
import {StartPageI} from "../pages/startpage";
import {GetBackendURL} from "../utils";


export interface registrationState {
    username: string
    password: string
    showWarning: boolean
    showError: boolean
    errorMessage: string
}

const RegistrationPage: FC<StartPageI> = ({userState, setUserState, showRegistration, setShowRegistration}) => {
    const initRegistrationState: registrationState = {
        username: "",
        password:"",
        showWarning: true,
        showError: false,
        errorMessage: ""
    }

    const [formState, setFormState] = useState(initRegistrationState)

    function handleRegistration() {
        if (formState.password === "") {
            setFormState({
                password: formState.password,
                username: formState.username,
                errorMessage: "Password field is empty",
                showWarning: false,
                showError: true
            })
            return;
        }

        fetch("http://"+GetBackendURL()+'/register', {
            method: "POST",
            body: JSON.stringify(
                {
                    username: formState.username,
                    password: formState.password
                })
        })
        .then(result => {
            if (result.ok) {
                return result.json()
            } else {
                return result.text().then(text => {
                    throw new Error(`Request rejected with status ${result.status} and message ${text}`);
                })
            }
        })
        .then(data => {
            setUserState({
                username: data.body.username,
                authToken: data.body.auth_token,
                expiry: data.body.expiry,
                refreshToken: data.body.refresh_token,
                currentGame: null
            })
        }).catch(err => {
            //todo; error text on page
            console.log(err);


            let invalidUsername = err.toString().includes("users_username_key");
            let errorMessage = ""

            if (invalidUsername) {
                errorMessage += " Username is already in use."
            }

            setFormState({
                password: formState.password,
                username: formState.username,
                errorMessage: errorMessage,
                showWarning: false,
                showError: true
            })
        })
    }

    return (
        <Segment className={"container"}>
            <div className={"containerDiv"}>
                <Header as={"h2"}>Register</Header>
                <Form warning={formState.showWarning} error={formState.showError}>
                    <Form.Field
                        label={"Username"}
                        id={"username"}
                        control={Input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{

                            setFormState({
                                username: e.target.value,
                                password: formState.password,
                                showWarning: false,
                                showError: formState.showError,
                                errorMessage: ""
                            })
                        }}
                    />
                    <Form.Field
                        label={"Password"}
                        id={"password"}
                        type={"password"}
                        control={Input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                            setFormState({
                                username: formState.username,
                                password: e.target.value,
                                showWarning: false,
                                showError: formState.showError,
                                errorMessage: ""
                            })
                        }}
                    />
                    <Message error>
                        <Message.Header>A Problem Occurred</Message.Header>
                        <p>{formState.errorMessage}</p>
                    </Message>
                </Form>
                <br/>
                <Button type={"submit"} onClick={() => handleRegistration()}>Register</Button>
            </div>
            <Message warning>
                <Icon name='help' />
                Already have an account?&nbsp;<a onClick={()=>{setShowRegistration(false);}}>Login here</a>&nbsp;instead.
            </Message>
        </Segment>
    );
}

export default RegistrationPage;
