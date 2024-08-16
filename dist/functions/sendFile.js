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
const axios_1 = __importDefault(require("axios"));
const cli_color_1 = __importDefault(require("cli-color"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const zlib_1 = __importDefault(require("zlib"));
const uploadPr_1 = require("./upload/uploadPr");
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
const zipBranchChanges = (minifiedJson) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        zlib_1.default.gzip(minifiedJson, (err, buffer) => {
            if (!err) {
                const branchChanges = buffer.toString("base64");
                resolve(branchChanges);
            }
            else {
                console.error("Error compressing data:", err);
                reject(err);
            }
        });
    });
});
function Push(diff, branchname, parentBranch, history) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const prRequestfilePath = path_1.default.join(process.cwd(), "../", "pr.gz");
        const dataBranches = fs_1.default.readFileSync(path_1.default.join(process.cwd(), ".gitpulse", "BRANCHES.json"), "utf-8");
        const parsedJson = dataBranches ? JSON.parse(dataBranches) : null;
        if (!parsedJson || !parsedJson[branchname]) {
            return console.log(cli_color_1.default.redBright(`Opps this branch does not exist`));
        }
        const minifiedJson = JSON.stringify(parsedJson[branchname]);
        const miniJson = yield zipBranchChanges(minifiedJson);
        console.log(diff, "branchname", branchname, "parentBranch", parentBranch, "history", history);
        yield fs_extra_1.default.remove(prRequestfilePath);
        const filesArray = diff.map((file) => {
            return path_1.default.join(process.cwd(), ".gitpulse", "Branch_modifications", file);
        });
        const output = fs_1.default.createWriteStream(prRequestfilePath);
        const archive = (0, archiver_1.default)('zip', {
            zlib: { level: 9 }
        });
        const archivePromise = new Promise((resolve, reject) => {
            output.on('close', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield console.log(cli_color_1.default.magentaBright("Zipped", `${archive.pointer()} total bytes`));
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            }));
            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    console.warn('Warning:', err);
                }
                else {
                    reject(err);
                }
            });
            archive.on('error', (err) => {
                reject(err);
            });
            archive.pipe(output);
        });
        for (const filePath of filesArray) {
            const paths = (0, exports.getAllFilesForPR)(filePath);
            for (const filPath of paths) {
                const relativePath = path_1.default.relative(path_1.default.join(process.cwd(), ".gitpulse", "Branch_modifications"), filPath);
                archive.file(filPath, { name: path_1.default.join("CHANGES", relativePath) });
            }
        }
        archive.append(miniJson, { name: "branchChanges.txt" });
        yield archive.finalize();
        yield archivePromise;
        const reponame = yield promptQuestion('Enter Repo name: ');
        const username = yield promptQuestion('Enter your email: ');
        const password = yield promptQuestion('Enter your password: ');
        const message = yield promptQuestion('Enter pull request message: ');
        //@ts-ignore
        if (reponame.length < 6 && username.length < 6 || password.length < 6) {
            return console.log(cli_color_1.default.redBright(`Reponame or Name or Password is too short !!`));
        }
        if (diff.length === 0) {
            return console.log(cli_color_1.default.redBright(`Nothing to commit`));
        }
        //@ts-ignore
        if (message.length > 50) {
            return console.log(cli_color_1.default.redBright(`PR message is too big !!`));
        }
        try {
            const result = yield axios_1.default.post(`http://localhost:3000/push-origin`, {
                email: username, password, repoName: reponame, totalCommits: history.length, childBranch: branchname, parentBranch, message
            });
            if (result.data.status) {
                return console.log(cli_color_1.default.redBright(result.data.message));
            }
            yield (0, uploadPr_1.uploadPullRequest)(result.data.message);
            return console.log(cli_color_1.default.greenBright(`Created a pull request to ${reponame} successfully`));
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.log(cli_color_1.default.redBright(`Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}`));
                console.log(cli_color_1.default.redBright(`Data: ${JSON.stringify((_b = error.response) === null || _b === void 0 ? void 0 : _b.data)}`));
                console.log(cli_color_1.default.redBright(`Headers: ${JSON.stringify((_c = error.response) === null || _c === void 0 ? void 0 : _c.headers)}`));
            }
            else if (error instanceof Error) {
                console.log(cli_color_1.default.redBright("Error:"));
                console.log(cli_color_1.default.redBright(error.message));
            }
            else {
                console.log(cli_color_1.default.redBright("Unexpected error:", error));
            }
        }
    });
}
exports.Push = Push;
//a change
