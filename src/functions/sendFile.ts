
import axios from 'axios';
import clc from 'cli-color';
import path from 'path';
import readline from "readline";
import fs from "fs";
import archiver from 'archiver';
import fsExtra from "fs-extra"
import { BranchInterface } from '../util';
import zlib from 'zlib';
import { uploadPullRequest } from './upload/uploadPr';

export function promptQuestion(query:string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, (answer:string) => {
    rl.close();
    resolve(answer);
  }));
}

export const getAllFilesForPR = (folderPath: string): string[] => {
  let response: string[] = [];
  const allFilesAndFolders = fs.readdirSync(folderPath);

  if (allFilesAndFolders.length === 0) {
      response.push(folderPath);
  } else {
      allFilesAndFolders.forEach(file => {
          const fullFilePath = path.join(folderPath, file);
          if (fs.statSync(fullFilePath).isDirectory()) {
              // Recursively get files and directories
              response = response.concat(getAllFilesForPR(fullFilePath));
          } else {
              response.push(fullFilePath);
          }
      });
  }
  return response;
}

const zipBranchChanges = async (minifiedJson: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    zlib.gzip(minifiedJson, (err, buffer) => {
      if (!err) {
        const branchChanges = buffer.toString("base64");
        resolve(branchChanges);
      } else {
        console.error("Error compressing data:", err);
        reject(err);
      }
    });
  });
};


export async function Push(diff: string[], branchname: string, parentBranch: string, history: string[]) {
  const prRequestfilePath = path.join(process.cwd(),"../","pr.gz");
  const dataBranches = fs.readFileSync(path.join(process.cwd(),".gitpulse","BRANCHES.json"),"utf-8");
  const parsedJson:BranchInterface = dataBranches ? JSON.parse(dataBranches) : null;
  if(!parsedJson || !parsedJson[branchname]){
    return console.log(clc.redBright(`Opps this branch does not exist`))
  }
  const minifiedJson = JSON.stringify(parsedJson[branchname]);
  const miniJson  = await zipBranchChanges(minifiedJson);

  console.log(diff,"branchname",branchname,"parentBranch",parentBranch,"history",history);

  
  await fsExtra.remove(prRequestfilePath);
  const filesArray = diff.map((file)=>{
    return path.join(process.cwd(),".gitpulse","Branch_modifications",file);
  }); 

  const output = fs.createWriteStream(prRequestfilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  const archivePromise = new Promise<void>((resolve, reject) => {
    output.on('close', async () => {
      try {
        await console.log(clc.magentaBright("Zipped" ,`${archive.pointer()} total bytes`));
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
  });

  for (const filePath of filesArray) {
    const paths = getAllFilesForPR(filePath);
    for (const filPath of paths) {
      const relativePath = path.relative(path.join(process.cwd(), ".gitpulse", "Branch_modifications"), filPath);
      archive.file(filPath, { name: path.join("CHANGES",relativePath) });
    }
  }

  archive.append(miniJson, { name: "branchChanges.txt" });

  await archive.finalize();
  await archivePromise;

  const reponame = await promptQuestion('Enter Repo name: ')
  const username = await promptQuestion('Enter your email: ');
  const password = await promptQuestion('Enter your password: ');
  const message = await promptQuestion('Enter pull request message: ');

  //@ts-ignore
  if(reponame.length<6 && username.length < 6 || password.length < 6){
    return console.log(clc.redBright(`Reponame or Name or Password is too short !!`));
  }
  if(diff.length===0){
    return console.log(clc.redBright(`Nothing to commit`));
  }
  //@ts-ignore
  if(message.length > 50){
    return console.log(clc.redBright(`PR message is too big !!`));
  }
  try {
    const result = await axios.post(`http://localhost:3000/push-origin`,{
      email:username,password,repoName:reponame,totalCommits:history.length,childBranch:branchname,parentBranch,message
    })
    if(result.data.status){
      return console.log(clc.redBright(result.data.message))
    }
    await uploadPullRequest(result.data.message);
    return console.log(clc.greenBright(`Created a pull request to ${reponame} successfully`))
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

//a change