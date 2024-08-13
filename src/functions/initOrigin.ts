import axios from "axios";
import { promptQuestion } from "./sendFile";
import clc from "cli-color";

export async function initOriginMethod() {
    try {
        const reponame = await promptQuestion('Enter Repo name: ')
        const email = await promptQuestion('Enter your username: ');
        const password = await promptQuestion('Enter your password: ');
        const result = await axios.post(`http://localhost:3000/init`,{reponame,email,password});
        console.log(result.data)
    } catch (error) {  
        //@ts-ignore
        console.log(clc.redBright(error.response.data.message));
    }
}