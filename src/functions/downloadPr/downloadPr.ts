import axios from "axios";
import path from "path";
import fs from "fs"
import clc from "cli-color";
import fsExtra from "fs-extra"
import unzipper from 'unzipper';
import zlib from "zlib";
import { BranchInterface, BranchKeyValueItems } from "../../util";


export async function downloadPr(preUrl:any,parentBranch:string,childBranch:string) {
    const downloadDir = path.join(process.cwd(), "../", "merge", "pr");
    const extractedZipDir = path.join(process.cwd(), "../", "merge", "pr","extracted");
    await writeBranchChangesTxt(extractedZipDir,parentBranch,childBranch);
    // await copyAndPasteBranchesAndCommits(extractedZipDir);
    // const filename = path.basename(new URL(preUrl).pathname); 
    // const downloadfilePath = path.join(downloadDir, filename);
    // await fsExtra.mkdirp(downloadDir);

  //  try {

  //   const response = await axios.get(preUrl,{ responseType: 'stream' });

  //   // Validate response status code
  //   if (response.status !== 200) {
  //     throw new Error(`Error downloading file: ${response.status}`);
  //   }
    
  //   const writer = fs.createWriteStream(downloadfilePath);
    

  //   await new Promise((resolve, reject) => {
  //     response.data.pipe(writer)
  //       .on('finish', () => resolve(downloadfilePath))
  //       .on('error', reject);
  //   });

  //   console.log(`File successfully downloaded to: ${downloadfilePath}`);
  //   await extractZip(downloadfilePath, extractedZipDir);
    

  //  } catch (error) {
  //   //@ts-ignore
  //   console.log(error)
  //   if (axios.isAxiosError(error)) {
  //       console.log(clc.redBright(`Status: ${error.response?.status}`));
  //       console.log(clc.redBright(`Data: ${JSON.stringify(error.response?.data)}`));
  //       console.log(clc.redBright(`Headers: ${JSON.stringify(error.response?.headers)}`));
  //   } else if (error instanceof Error) {
  //       console.log(clc.redBright("Error:"));
  //       console.log(clc.greenBright(error.message));
  //   } else {
  //       console.log(clc.redBright("Unexpected error:", error));
  //   }
  //  }
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

  async function copyAndPasteBranchesAndCommits(extractedZipDir:string){
    const downloadDir = path.join(process.cwd(), "../", "merge");
    const branchesObjPath = path.join(process.cwd(),"/.gitpulse","Branch_modifications");
    // console.log("branchesObjPath",branchesObjPath);
    const changesDir = path.join(extractedZipDir, "CHANGES");
    try {
        // Copy the entire CHANGES directory to the branchesObjPath
        await fsExtra.copy(changesDir, branchesObjPath);
        console.log(clc.greenBright(`Merged PR changes successfully`));
        await fsExtra.remove(downloadDir);
    } catch (err) {
        console.error("Error copying files:", err);
    }
  }

  async function writeBranchChangesTxt(writeBranchChangesTxt:string,parentBranch:string,childBranch:string) {
   try {
    console.log("PAR",parentBranch,"CHILD",childBranch);
    const branchZippedData = fs.readFileSync(path.join(writeBranchChangesTxt,"branchChanges.txt"),"utf-8")
    const buffer = Buffer.from(branchZippedData, 'base64'); 
    const decompressed = zlib.gunzipSync(buffer);
    const decodedData = decompressed.toString('utf-8');
    const parsedJson = JSON.parse(decodedData);

    const branchesJsonData = fs.readFileSync(path.join(process.cwd(),"/.gitpulse","BRANCHES.json"),"utf-8")
    const parsedBranchesJsonData:BranchInterface = branchesJsonData ? JSON.parse(branchesJsonData):null;

    parsedBranchesJsonData[childBranch] = {
      ...parsedBranchesJsonData[childBranch],
      ...parsedJson
    };
    if(!parsedBranchesJsonData[parentBranch]){
      return console.log(clc.redBright(`Parent branch - ${parentBranch} does not exist`));
    }
    // fs.writeFileSync(path.join(process.cwd(),"/.gitpulse","BRANCHES.json"), JSON.stringify(parsedBranchesJsonData, null, 2), "utf-8");

    const branchesHistorykeymap = fs.readFileSync(path.join(process.cwd(),"/.gitpulse","Branch_Key_Value.json"),"utf-8");
    
    let parsedBranchesJsonDataKeyMap: BranchKeyValueItems;
    if (branchesHistorykeymap.trim() === "") {
        parsedBranchesJsonDataKeyMap = {}; // Initialize as an empty object if the file is empty
    } else {
        parsedBranchesJsonDataKeyMap = JSON.parse(branchesHistorykeymap);
    }

    if (!parsedBranchesJsonDataKeyMap[parentBranch]) {
      parsedBranchesJsonDataKeyMap[childBranch] = [];
  }
  
  // Push new values into the array associated with the key
  parsedBranchesJsonDataKeyMap[parentBranch].push(...[childBranch]);
  fs.writeFileSync(path.join(process.cwd(),"/.gitpulse","Branch_Key_Value.json"), JSON.stringify(parsedBranchesJsonDataKeyMap, null, 2))


   } catch (error) {
    return console.log(error)
    
   }
  }