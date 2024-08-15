import axios from "axios";
import path from "path";
import fs from "fs"
import clc from "cli-color";
import fsExtra from "fs-extra"

export async function downloadPr(preUrl:any) {
    const downloadfilePath = path.join(process.cwd(),"../","merge")
    await fsExtra.mkdirp(downloadfilePath); 
   try {

    const response = await axios.get(preUrl,{ responseType: 'stream' });

    // Validate response status code
    if (response.status !== 200) {
      throw new Error(`Error downloading file: ${response.status}`);
    }

    const writer = fs.createWriteStream(downloadfilePath);

    await new Promise((resolve, reject) => {
      response.data.pipe(writer)
        .on('finish', () => resolve(downloadfilePath))
        .on('error', reject);
    });

    console.log(`File successfully downloaded to: ${downloadfilePath}`);

   } catch (error) {
    //@ts-ignore
    console.log(error)
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
