import axios from "axios";
import { promptQuestion } from "../sendFile";
import clc = require("cli-color");
import { downloadPr } from "../downloadPr/downloadPr";

export async function mergePullRequest() {
    try {
        // const reponame = await promptQuestion('Enter your repo name: ')
        const prid = await promptQuestion('Enter pull request id: ');
        const email = await promptQuestion('Enter your email: ');
        const password = await promptQuestion('Enter your password: ');
        const result = await axios.post("http://localhost:3000/merge",{prid,email,password});
        if(result.data.status){
            return console.log(clc.redBright(result.data.message))
        }
        await downloadPr(result.data.message);



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