import axios from "axios";
import { promptQuestion } from "./sendFile";
import clc from "cli-color";
import { getAllFiles } from "./file";
import path from "path";
import { zipFiles } from "./zipFiles";

export async function initOriginMethod() {
    try {
        const a = path.join(process.cwd());
        console.log(a)
        //! should i also include "dist"
        const files =  getAllFiles(a);
        await zipFiles(files);
        return;
        const reponame = await promptQuestion('Enter Repo name: ')
        const email = await promptQuestion('Enter your username: ');
        const password = await promptQuestion('Enter your password: ');
        // const result = await axios.post(`http://localhost:3000/init`,{reponame,email,password});
        // const preUrl = result.data.message;
        // console.log("preUrl",);

    } catch (error) {  
        //@ts-ignore
        // console.log(clc.redBright(error.response.data.message));
    }
}