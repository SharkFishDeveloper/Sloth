"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Push = exports.getAllFilesForPR = exports.promptQuestion = void 0;
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
function promptQuestion(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}
exports.promptQuestion = promptQuestion;
const getAllFilesForPR = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    if (allFilesAndFolders.length === 0) {
        response.push(folderPath);
    }
    else {
        allFilesAndFolders.forEach(file => {
            const fullFilePath = path_1.default.join(folderPath, file);
            if (fs_1.default.statSync(fullFilePath).isDirectory()) {
                // Recursively get files and directories
                response = response.concat((0, exports.getAllFilesForPR)(fullFilePath));
            }
            else {
                response.push(fullFilePath);
            }
        });
    }
    return response;
};
exports.getAllFilesForPR = getAllFilesForPR;
function Push(diff, branchname, parentBranch, history) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(diff, "branchname", branchname, "parentBranch", parentBranch, history);
        const messages = [];
        for (const id in history) {
            const entry = history[id];
            messages.push(entry.message);
        }
        console.log(messages);
        return;
        // const prRequestfilePath = path.join(process.cwd(),"../","pr.gz");
        // await fsExtra.remove(prRequestfilePath);
        // const filesArray = diff.map((file)=>{
        //   return path.join(process.cwd(),".gitpulse","Branch_modifications",file);
        // }); 
        // const output = fs.createWriteStream(prRequestfilePath);
        // const archive = archiver('zip', {
        //   zlib: { level: 9 }
        // });
        // const archivePromise = new Promise<void>((resolve, reject) => {
        //   output.on('close', async () => {
        //     try {
        //       await console.log(clc.magentaBright("Zipped" ,`${archive.pointer()} total bytes`));
        //       resolve();
        //     } catch (err) {
        //       reject(err);
        //     }
        //   });
        //   archive.on('warning', (err) => {
        //     if (err.code === 'ENOENT') {
        //       console.warn('Warning:', err);
        //     } else {
        //       reject(err);
        //     }
        //   });
        //   archive.on('error', (err) => {
        //     reject(err);
        //   });
        //   archive.pipe(output);
        // });
        // for (const filePath of filesArray) {
        //   const paths = getAllFilesForPR(filePath);
        //   for (const filPath of paths) {
        //     const relativePath = path.relative(path.join(process.cwd(), ".gitpulse", "Branch_modifications"), filPath);
        //     archive.file(filPath, { name: relativePath });
        //   }
        // }
        // await archive.finalize();
        // await archivePromise;
        // const messages:string[] = [];
        // for(const id in history){
        //   const entry = history[id];
        //   messages.push(entry.message);
        // }
        // console.log(messages)
        // const reponame = await promptQuestion('Enter Repo name: ')
        // const username = await promptQuestion('Enter your username: ');
        // const password = await promptQuestion('Enter your password: ');
        // //@ts-ignore
        // if(reponame.length<6 && username.length < 6 || password.length < 6){
        //   return console.log(clc.redBright(`Reponame or Name or Password is too short !!`));
        // }
        // if(diff.length===0){
        //   return console.log(clc.redBright(`Nothing to commit`));
        // }
        // try {
        //   const result = await axios.post(`http://localhost:3000/push-origin`,{
        //     email:username,password,reponame
        //   })
        //   if(result.data.status){
        //     return console.log(clc.redBright(result.data.message))
        //   }
        //   console.log(clc.greenBright(result.data.message))
        // } catch (error) {
        //   if (axios.isAxiosError(error)) {
        //     console.log(clc.redBright(`Status: ${error.response?.status}`));
        //     console.log(clc.redBright(`Data: ${JSON.stringify(error.response?.data)}`));
        //     console.log(clc.redBright(`Headers: ${JSON.stringify(error.response?.headers)}`));
        // } else if (error instanceof Error) {
        //     console.log(clc.redBright("Error:"));
        //     console.log(clc.redBright(error.message));
        // } else {
        //     console.log(clc.redBright("Unexpected error:", error));
        // }
        // }
    });
}
exports.Push = Push;
