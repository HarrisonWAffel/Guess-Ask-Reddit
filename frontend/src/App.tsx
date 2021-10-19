import React, {createContext, useContext, useEffect, useState} from 'react';
import './App.css';
import StartPage from "./pages/startpage";
import HomePage from "./pages/homePage";

import "./index.css"

import {GameI} from "./components/Game";
import {Header} from "semantic-ui-react";

export interface UserState {
    username: string
    email: string
    authToken: string
    refreshToken: string
    currentGame: GameI | null
}

export type UserStateI = {
    userState: UserState,
    setUserState: React.Dispatch<React.SetStateAction<UserState>>
}

const initialUserState: UserState = {
    username: "",
    email: "",
    authToken:"",
    refreshToken:"",
    currentGame: null,
}

export const AppCtx = createContext(initialUserState);
export function useAppCtx() {
    return useContext(AppCtx)
}

function App() {
    const [userState, setUserState] = useState(JSON.parse(localStorage.getItem("userState") as string) || initialUserState);
    useEffect(() => {
        localStorage.setItem("userState", JSON.stringify(userState))
    })

    if (userState.authToken === "") {
        return <div>
            <StartPage
                    userState={userState}
                    setUserState={setUserState}
        />
        </div>
    } else {
        return <HomePage
                    userState={userState}
                    setUserState={setUserState}
                />
    }
}

export default App;
