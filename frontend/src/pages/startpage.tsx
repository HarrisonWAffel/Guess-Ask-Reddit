import React, {FC, useState} from "react";
import {UserState, UserStateI} from "../App";
import RegistrationPage from "../components/Register";
import LoginPage from "../components/Login";
import {Grid} from "semantic-ui-react";

export type StartPageI = {
    userState: UserState
    setUserState: React.Dispatch<React.SetStateAction<UserState>>
    showRegistration: boolean
    setShowRegistration: React.Dispatch<React.SetStateAction<boolean>>
}

const StartPage: FC<UserStateI> = ({userState, setUserState}) => {
    const [showRegistration, setShowRegistration] = useState(false);
    if (showRegistration) {
        return   <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 500 }}>
                        <RegistrationPage
                            userState={userState}
                            setUserState={setUserState}
                            showRegistration={showRegistration}
                            setShowRegistration={setShowRegistration}/>
                    </Grid.Column>
                </Grid>
    } else {
        return <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 500 }}>
                    <LoginPage
                        userState={userState}
                        setUserState={setUserState}
                        showRegistration={showRegistration}
                        setShowRegistration={setShowRegistration}/>
                </Grid.Column>
            </Grid>
    }
}

export default StartPage;