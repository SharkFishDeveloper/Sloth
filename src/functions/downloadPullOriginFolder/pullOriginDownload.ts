import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import axios from "axios";
import clc from "cli-color";
import unzipper from "unzipper"

export async function pullOriginDownload(preUrl:string) {
    const downloadDir = path.join(process.cwd(), "../");
    const extractedZipDir = path.join(process.cwd(),"../", "../","Sloth");

    const filename = path.basename(new URL(preUrl).pathname); 
    const downloadfilePath = path.join(downloadDir,filename);
    await fsExtra.mkdirp(downloadDir);

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
    await extractZip(downloadfilePath, extractedZipDir);
    

   } catch (error) {
    //@ts-ignore
    // console.log(error)
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

async function extractZip(zipFilePath: string, outputDir: string) {
    console.log(`Extracting ${zipFilePath} to ${outputDir}`);
    
    // Create extraction directory if it doesn't exist
    await fsExtra.mkdirp(outputDir);
  
    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .on('close', () => {
          console.log(`Extraction complete to ${outputDir}`);
          resolve();
        })
        .on('error', reject);
    });
  }