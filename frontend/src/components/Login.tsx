import React, {FC, useState} from "react";
import {Button, Divider, Form, Header, Icon, Input, Message, Segment} from "semantic-ui-react";
import {StartPageI} from "../pages/startpage";
import About from "./About";

export interface LoginState {
    username: string
    password: string
    showError: boolean
    errorMessage: string
}

const LoginPage: FC<StartPageI> = ({userState, setUserState, showRegistration, setShowRegistration}) => {
    const initLoginState: LoginState = {username:"", password:"", showError: false, errorMessage: ""}
    const [loginState, setLoginState] = useState(initLoginState)

    function login() {
        let errorMessage = "";
        if (loginState.username === "") {
            errorMessage = "User Name Field Is Empty"
            setLoginState({
                password: loginState.password,
                username: loginState.username,
                showError: true,
                errorMessage: errorMessage
            })
            return;
        }

        if (loginState.password === "") {
            errorMessage = "Password Field Is Empty"
            setLoginState({
                password: loginState.password,
                username: loginState.username,
                showError: true,
                errorMessage: errorMessage
            })
            return;
        }

        fetch('http://localhost:1337/login', {
            method: "POST",
            body: JSON.stringify(
                {
                    username: loginState.username,
                    password: loginState.password
                })
        }).then(result => {
                if (result.ok) {
                    return result.json()
                } else {
                    return result.text().then(text => {
                        throw new Error(`Request rejected with status ${result.status} and message ${text}`);
                    })
                }
        }).then(data => {
            setUserState({
                username: data.body.username,
                email: data.body.email,
                authToken: data.body.auth_token,
                refreshToken: data.body.refresh_token,
                expiry: data.body.expiry,
                currentGame: null
            });
        }).catch(err => {
            let invalidUser = err.toString().includes("could not find user with username");
            let invalidPassword = err.toString().includes("invalid password")
            if (invalidUser) {
                errorMessage = "Invalid Username"
                setLoginState({
                    password: loginState.password,
                    username: loginState.username,
                    showError: true,
                    errorMessage: errorMessage
                })
            }

            if (invalidPassword) {
                errorMessage = "Invalid Password"
                setLoginState({
                    password: loginState.password,
                    username: loginState.username,
                    showError: true,
                    errorMessage: errorMessage
                })
            }
        })
    }

    return (
        <div>
        <About/>
        <Segment className={"container"}>
            <Header as={"h1"}>Guess Ask Reddit</Header>
            <Divider/>
            <Form className={"containerDiv"} error={loginState.showError}>
                <Header as={"h3"}>Login</Header>
                <Form.Field
                    type={"username"}
                    label={"User Name"}
                    id={"username"}
                    control={Input}
                    width={16}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                        setLoginState({
                            password: loginState.password,
                            username: e.target.value,
                            showError: false,
                            errorMessage: ""
                        })
                    }}
                />
                <Form.Field
                    type={"password"}
                    label={"Password"}
                    id={"password"}
                    control={Input}
                    width={16}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                        setLoginState({
                            password: e.target.value,
                            username: loginState.username,
                            showError: false,
                            errorMessage: ""
                        })
                    }}
                />
                <Button type={"submit"} onClick={()=>{alert("TODO")}}>Reset Password</Button>
                <Button type={"submit"} onClick={()=> login()}>Login</Button>
                <Message error>
                    <Message.Header>{loginState.errorMessage}</Message.Header>
                </Message>
            </Form>
        <Message warning>
            <Icon name='help' />
            Don't have an account?&nbsp;<a onClick={()=>{setShowRegistration(true);}}>Register here</a>&nbsp;instead. (Email optional)
        </Message>
        </Segment>
        </div>
    )
}

export default LoginPage;