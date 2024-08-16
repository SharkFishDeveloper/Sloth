import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import axios from "axios";
import clc from "cli-color";
import unzipper from "unzipper"

export async function pullOriginDownload(preUrl:string) {
    const downloadDir = path.join(process.cwd(), "../","pull-origin");
    const extractedZipDir = path.join(process.cwd(),"../","pull-origin");

    const filename = path.basename(new URL(preUrl).pathname); 
    const downloadfilePath = path.join(downloadDir,filename);
    await fsExtra.mkdirp(downloadDir);

   try {

    const response = await axios.get(preUrl,{ responseType: 'stream' });

    // Validate response status code
    if (response.status !== 200) {
      throw new Error(`Error downloading file: ${response.status}`);
    }
    
    // const writer = fs.createWriteStream(downloadfilePath);
    

    // await new Promise((resolve, reject) => {
    //   response.data.pipe(writer)
    //     .on('finish', () => resolve(downloadfilePath))
    //     .on('error', reject);
    // });
    const yourRepoName = path.basename(path.join(process.cwd(),"../"));

    console.log(`File successfully downloaded to: ${downloadfilePath}`);
    await extractZip(downloadfilePath, extractedZipDir);
    // fs.readdir(downloadDir,async(err,files)=>{
    //   if(!files.includes(yourRepoName)){
    //     console.log(clc.yellowBright(`First download it, and then you can pull latest changes*`));
    //     await fsExtra.remove(downloadDir);
    //   }
    // })
    await copySlothFolderAndRemoveZip(yourRepoName,downloadDir);


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

    await fsExtra.mkdirp(outputDir);
  
    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: outputDir, }))
        .on('close', () => {
          console.log(`Extraction complete to ${outputDir}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  async function copySlothFolderAndRemoveZip(yourRepoName:string , downloadDir:string) {
    const pathname = path.join(downloadDir,yourRepoName);
    console.log(pathname,path.join(process.cwd(),"../"))
    fsExtra.copy(pathname,path.join(process.cwd(),"../"))
  }