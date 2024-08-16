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
exports.downloadPr = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cli_color_1 = __importDefault(require("cli-color"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const unzipper_1 = __importDefault(require("unzipper"));
const zlib_1 = __importDefault(require("zlib"));
function downloadPr(preUrl, parentBranch, childBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadDir = path_1.default.join(process.cwd(), "../", "merge", "pr");
        const extractedZipDir = path_1.default.join(process.cwd(), "../", "merge", "pr", "extracted");
        // await copyAndPasteBranchesAndCommits(extractedZipDir);
        yield writeBranchChangesTxt(extractedZipDir, parentBranch, childBranch);
        return;
        //     const filename = path.basename(new URL(preUrl).pathname); 
        //     const downloadfilePath = path.join(downloadDir, filename);
        //     console.log("S")
        //     await fsExtra.mkdirp(downloadDir);
        //     console.log("E")
        //    try {
        //     const response = await axios.get(preUrl,{ responseType: 'stream' });
        //     // Validate response status code
        //     if (response.status !== 200) {
        //       throw new Error(`Error downloading file: ${response.status}`);
        //     }
        //     const writer = fs.createWriteStream(downloadfilePath);
        //     await new Promise((resolve, reject) => {
        //       response.data.pipe(writer)
        //         .on('finish', () => resolve(downloadfilePath))
        //         .on('error', reject);
        //     });
        //     console.log(`File successfully downloaded to: ${downloadfilePath}`);
        //     await extractZip(downloadfilePath, extractedZipDir);
        //    } catch (error) {
        //     //@ts-ignore
        //     console.log(error)
        //     if (axios.isAxiosError(error)) {
        //         console.log(clc.redBright(`Status: ${error.response?.status}`));
        //         console.log(clc.redBright(`Data: ${JSON.stringify(error.response?.data)}`));
        //         console.log(clc.redBright(`Headers: ${JSON.stringify(error.response?.headers)}`));
        //     } else if (error instanceof Error) {
        //         console.log(clc.redBright("Error:"));
        //         console.log(clc.greenBright(error.message));
        //     } else {
        //         console.log(clc.redBright("Unexpected error:", error));
        //     }
        //    }
    });
}
exports.downloadPr = downloadPr;
function extractZip(zipFilePath, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Extracting ${zipFilePath} to ${outputDir}`);
        // Create extraction directory if it doesn't exist
        yield fs_extra_1.default.mkdirp(outputDir);
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(zipFilePath)
                .pipe(unzipper_1.default.Extract({ path: outputDir }))
                .on('close', () => {
                console.log(`Extraction complete to ${outputDir}`);
                resolve();
            })
                .on('error', reject);
        });
    });
}
function copyAndPasteBranchesAndCommits(extractedZipDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchesObjPath = path_1.default.join(process.cwd(), "/.gitpulse", "Branch_modifications");
        console.log("branchesObjPath", branchesObjPath);
        const changesDir = path_1.default.join(extractedZipDir, "CHANGES");
        try {
            // Copy the entire CHANGES directory to the branchesObjPath
            yield fs_extra_1.default.copy(changesDir, branchesObjPath);
            console.log(`Successfully copied CHANGES to ${branchesObjPath}`);
        }
        catch (err) {
            console.error("Error copying files:", err);
        }
    });
}
function writeBranchChangesTxt(writeBranchChangesTxt, parentBranch, childBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("PAR", parentBranch, "CHILD", childBranch);
            const branchZippedData = fs_1.default.readFileSync(path_1.default.join(writeBranchChangesTxt, "branchChanges.txt"), "utf-8");
            const buffer = Buffer.from(branchZippedData, 'base64');
            const decompressed = zlib_1.default.gunzipSync(buffer);
            const decodedData = decompressed.toString('utf-8');
            const parsedJson = JSON.parse(decodedData);
            const branchesJsonData = fs_1.default.readFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "BRANCHES.json"), "utf-8");
            const parsedBranchesJsonData = branchesJsonData ? JSON.parse(branchesJsonData) : null;
            const newCommit = { [childBranch]: parsedJson };
            parsedBranchesJsonData[childBranch] = Object.assign(Object.assign({}, parsedBranchesJsonData[childBranch]), parsedJson);
            fs_1.default.writeFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "BRANCHES.json"), JSON.stringify(parsedBranchesJsonData, null, 2), "utf-8");
            if (!parsedBranchesJsonData[parentBranch]) {
                return console.log(cli_color_1.default.redBright(`Parent branch - ${parentBranch} does not exist`));
            }
            const newParsedJsonData = parsedBranchesJsonData;
            console.log("NESTEED", newCommit);
        }
        catch (error) {
            return console.log(error);
        }
    });
}
