import React, {createContext, useContext, useEffect, useState} from 'react';
import './App.css';
import StartPage from "./pages/startpage";
import HomePage from "./pages/homePage";
import * as dotenv from 'dotenv';
import "./index.css"

import {GameI} from "./components/Game";
import {GetBackendURL, RefreshToken} from "./utils";

export interface UserState {
    username: string
    authToken: string
    refreshToken: string
    expiry: string
    currentGame: GameI | null
}

export type UserStateI = {
    userState: UserState,
    setUserState: React.Dispatch<React.SetStateAction<UserState>>
}

const initialUserState: UserState = {
    username: "",
    authToken:"",
    refreshToken:"",
    expiry: "",
    currentGame: null,
}

export const AppCtx = createContext(initialUserState);
export function useAppCtx() {
    return useContext(AppCtx)
}

function App() {
    dotenv.config();
    const [userState, setUserState] = useState(JSON.parse(localStorage.getItem("userState") as string) || initialUserState);
    useEffect(() => {
        localStorage.setItem("userState", JSON.stringify(userState))
    })

    useEffect(() => {
        if (((new Date(userState.expiry)) < new Date()) && userState.expiry !== '') {
            RefreshToken(setUserState)
                .catch(() => {
                    setUserState(initialUserState);
                })
        }
    }, [userState])

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
