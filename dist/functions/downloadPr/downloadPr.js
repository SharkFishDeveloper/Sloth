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
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cli_color_1 = __importDefault(require("cli-color"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const unzipper_1 = __importDefault(require("unzipper"));
const zlib_1 = __importDefault(require("zlib"));
function downloadPr(preUrl, parentBranch, childBranch) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const downloadDir = path_1.default.join(process.cwd(), "../", "merge", "pr");
        const extractedZipDir = path_1.default.join(process.cwd(), "../", "merge", "pr", "extracted");
        const filename = path_1.default.basename(new URL(preUrl).pathname);
        const downloadfilePath = path_1.default.join(downloadDir, filename);
        yield fs_extra_1.default.mkdirp(downloadDir);
        try {
            const response = yield axios_1.default.get(preUrl, { responseType: 'stream' });
            // Validate response status code
            if (response.status !== 200) {
                throw new Error(`Error downloading file: ${response.status}`);
            }
            const writer = fs_1.default.createWriteStream(downloadfilePath);
            yield new Promise((resolve, reject) => {
                response.data.pipe(writer)
                    .on('finish', () => resolve(downloadfilePath))
                    .on('error', reject);
            });
            // console.log(`File successfully downloaded to: ${downloadfilePath}`);
            yield extractZip(downloadfilePath, extractedZipDir);
            yield writeBranchChangesTxt(extractedZipDir, parentBranch, childBranch);
            yield copyAndPasteBranchesAndCommits(extractedZipDir);
        }
        catch (error) {
            //@ts-ignore
            // console.log(error)
            if (axios_1.default.isAxiosError(error)) {
                console.log(cli_color_1.default.redBright(`Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}`));
                console.log(cli_color_1.default.redBright(`Data: ${JSON.stringify((_b = error.response) === null || _b === void 0 ? void 0 : _b.data)}`));
                console.log(cli_color_1.default.redBright(`Headers: ${JSON.stringify((_c = error.response) === null || _c === void 0 ? void 0 : _c.headers)}`));
            }
            else if (error instanceof Error) {
                console.log(cli_color_1.default.redBright("Error:"));
                console.log(cli_color_1.default.greenBright(error.message));
            }
            else {
                console.log(cli_color_1.default.redBright("Unexpected error:", error));
            }
        }
    });
}
exports.downloadPr = downloadPr;
function extractZip(zipFilePath, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`Extracting ${zipFilePath} to ${outputDir}`);
        // Create extraction directory if it doesn't exist
        yield fs_extra_1.default.mkdirp(outputDir);
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(zipFilePath)
                .pipe(unzipper_1.default.Extract({ path: outputDir }))
                .on('close', () => {
                // console.log(`Extraction complete to ${outputDir}`);
                resolve();
            })
                .on('error', reject);
        });
    });
}
function copyAndPasteBranchesAndCommits(extractedZipDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadDir = path_1.default.join(process.cwd(), "../", "merge");
        const branchesObjPath = path_1.default.join(process.cwd(), "/.gitpulse", "Branch_modifications");
        // console.log("branchesObjPath",branchesObjPath);
        const changesDir = path_1.default.join(extractedZipDir, "CHANGES");
        try {
            // Copy the entire CHANGES directory to the branchesObjPath
            yield fs_extra_1.default.copy(changesDir, branchesObjPath);
            console.log(cli_color_1.default.greenBright(`Merged PR changes successfully`));
            console.log(cli_color_1.default.bgYellowBright(`This is not saved, to save it you need to run < push origin >`));
            yield fs_extra_1.default.remove(downloadDir);
        }
        catch (err) {
            // console.error("Error copying files:", err);
        }
    });
}
function writeBranchChangesTxt(writeBranchChangesTxt, parentBranch, childBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log("PAR",parentBranch,"CHILD",childBranch);
            const branchZippedData = fs_1.default.readFileSync(path_1.default.join(writeBranchChangesTxt, "branchChanges.txt"), "utf-8");
            const buffer = Buffer.from(branchZippedData, 'base64');
            const decompressed = zlib_1.default.gunzipSync(buffer);
            const decodedData = decompressed.toString('utf-8');
            const parsedJson = JSON.parse(decodedData);
            const branchesJsonData = fs_1.default.readFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "BRANCHES.json"), "utf-8");
            const parsedBranchesJsonData = branchesJsonData ? JSON.parse(branchesJsonData) : null;
            parsedBranchesJsonData[childBranch] = Object.assign(Object.assign({}, parsedBranchesJsonData[childBranch]), parsedJson);
            if (!parsedBranchesJsonData[parentBranch]) {
                return console.log(cli_color_1.default.redBright(`Parent branch - ${parentBranch} does not exist`));
            }
            fs_1.default.writeFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "BRANCHES.json"), JSON.stringify(parsedBranchesJsonData, null, 2), "utf-8");
            const branchesHistorykeymap = fs_1.default.readFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "Branch_Key_Value.json"), "utf-8");
            let parsedBranchesJsonDataKeyMap;
            if (branchesHistorykeymap.trim() === "") {
                parsedBranchesJsonDataKeyMap = {}; // Initialize as an empty object if the file is empty
            }
            else {
                parsedBranchesJsonDataKeyMap = JSON.parse(branchesHistorykeymap);
            }
            if (!parsedBranchesJsonDataKeyMap[parentBranch]) {
                parsedBranchesJsonDataKeyMap[parentBranch] = [];
            }
            // Push new values into the array associated with the key
            parsedBranchesJsonDataKeyMap[parentBranch].push(...[childBranch]);
            fs_1.default.writeFileSync(path_1.default.join(process.cwd(), "/.gitpulse", "Branch_Key_Value.json"), JSON.stringify(parsedBranchesJsonDataKeyMap, null, 2));
        }
        catch (error) {
            return console.log(error);
        }
    });
}
