import axios from "axios";
import { promptQuestion } from "../sendFile";
import clc from "cli-color";
import { pullOriginDownload } from "../downloadPullOriginFolder/pullOriginDownload";
import path from "path";
import { BACKEND_URL } from "../util/url";

export async function pullOriginRequest() {
    try {

        // const yourRepoName = path.basename(path.join(process.cwd(),"../"));

        const reponame = await promptQuestion('Enter repo name: ');
        //@ts-ignore
        // if(yourRepoName !== reponame){
        //     return console.log(clc.yellowBright(`First download it, and then you can pull latest changes*`));
        // }
        if(reponame.length < 6){
            return console.log(clc.redBright("Reponame is too short ..."));
        }
        const result = await axios.post(`${BACKEND_URL}/pull`,{reponame});
        if(result.data.status){
            return console.log(clc.redBright(result.data.message));
        }
        else {
            await pullOriginDownload(result.data.message);
            console.log(clc.magentaBright(`To show the latest changes, you need to switch branch/commit one time`))
        }
    } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
            console.log(clc.redBright(`Status: ${error.response?.status}`));
            console.log(clc.redBright(`Data: ${JSON.stringify(error.response?.data)}`));
            console.log(clc.redBright(`Headers: ${JSON.stringify(error.response?.headers)}`));
        } else if (error instanceof Error) {
            console.log(clc.redBright("Error:"));
            console.log(clc.greenBright(error.message));
        } else {
            console.log(clc.redBright("Unexpected error:", error));
        }
    }

}