import axios from "axios";
import { promptQuestion } from "./sendFile";
import clc from "cli-color";
import { getAllFiles } from "./file";
import path from "path";
import { zipFiles } from "./zipFiles";
import fs from "fs"
import { uploadFile } from "./uploadFile";
import { BACKEND_URL } from "./util/url";

export async function pushOriginOwner() {
    try {
        const reponame = await promptQuestion('Enter Repo name: ')
        const email = await promptQuestion('Enter your username: ');
        const password = await promptQuestion('Enter your password: ');
        const result = await axios.post(`${BACKEND_URL}/push`,{reponame,email,password});
        if(!result.data.id){
            return console.log(clc.redBright(result.data.message))
        }
        const a = path.join(process.cwd());
        const files =  getAllFiles(a);

        await zipFiles(files);
        
        const preUrl = result.data.message;
        const userId = result.data.id;
        await uploadFile(preUrl,userId);


    } catch (error) {  
        if (axios.isAxiosError(error)) {
            console.log(clc.redBright(`Status: ${error.response?.status}`));
            console.log(clc.redBright(`Data: ${JSON.stringify(error.response?.data)}`));
            console.log(clc.redBright(`Headers: ${JSON.stringify(error.response?.headers)}`));
        } else if (error instanceof Error) {
            console.log(clc.redBright("Error:"));
            console.log(clc.redBright(error.message));
        } else {
            console.log(clc.redBright("Unexpected error:", error));
        }
    }
}