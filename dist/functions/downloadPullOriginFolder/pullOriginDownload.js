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
exports.pullOriginDownload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const axios_1 = __importDefault(require("axios"));
const cli_color_1 = __importDefault(require("cli-color"));
const unzipper_1 = __importDefault(require("unzipper"));
function pullOriginDownload(preUrl) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const downloadDir = path_1.default.join(process.cwd(), "../", "pull-origin");
        const extractedZipDir = path_1.default.join(process.cwd(), "../", "pull-origin");
        const filename = path_1.default.basename(new URL(preUrl).pathname);
        const downloadfilePath = path_1.default.join(downloadDir, filename);
        yield fs_extra_1.default.mkdirp(downloadDir);
        //   const src = path.join(process.cwd());
        //   const dist = path.join(process.cwd(),"../","abc","Sloth");
        //   await fsExtra.copy(src,dist);
        // return;
        try {
            const response = yield axios_1.default.get(preUrl, { responseType: 'stream' });
            if (response.status !== 200) {
                throw new Error(`Error downloading file: ${response.status}`);
            }
            const writer = fs_1.default.createWriteStream(downloadfilePath);
            yield new Promise((resolve, reject) => {
                response.data.pipe(writer)
                    .on('finish', () => resolve(downloadfilePath))
                    .on('error', reject);
            });
            const yourRepoName = path_1.default.basename(path_1.default.join(process.cwd(), "../"));
            // console.log(`File successfully downloaded to: ${downloadfilePath}`);
            yield extractZip(downloadfilePath, extractedZipDir);
            fs_1.default.readdir(downloadDir, (err, files) => __awaiter(this, void 0, void 0, function* () {
                if (!files.includes(yourRepoName)) {
                    console.log(cli_color_1.default.yellowBright(`First download it, and then you can pull latest changes*`));
                    yield fs_extra_1.default.remove(downloadDir);
                }
            }));
            yield copySlothFolderAndRemoveZip(yourRepoName, downloadDir);
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
exports.pullOriginDownload = pullOriginDownload;
function extractZip(zipFilePath, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`Extracting ${zipFilePath} to ${outputDir}`);
        yield fs_extra_1.default.mkdirp(outputDir);
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(zipFilePath)
                .pipe(unzipper_1.default.Extract({ path: outputDir, }))
                .on('close', () => {
                // console.log(`Extraction complete to ${outputDir}`);
                resolve();
            })
                .on('error', reject);
        });
    });
}
function copySlothFolderAndRemoveZip(yourRepoName, downloadDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const destPath = path_1.default.join(process.cwd(), "/.gitpulse");
        const deletGitpulse = path_1.default.join(destPath, "/.gitpulse");
        const pathname = path_1.default.join(downloadDir, yourRepoName, "Sloth", ".gitpulse");
        yield emptyDirExceptFile(destPath, "config.json");
        // console.log(pathname,destPath)
        yield fs_extra_1.default.copy(pathname, destPath, { overwrite: true });
        yield fs_extra_1.default.remove(downloadDir);
        return console.log(cli_color_1.default.greenBright(`You are upto date now -- :)`));
    });
}
function emptyDirExceptFile(dirPath, fileToExclude) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // List all files and directories inside the directory
            const items = yield fs_extra_1.default.readdir(dirPath);
            for (const item of items) {
                const itemPath = path_1.default.join(dirPath, item);
                // console.log(itemPath,"EXLCUDE",fileToExclude)
                // Check if the item is the file you want to exclude
                if (item === fileToExclude) {
                    // console.log(`Skipping file: ${itemPath}`);
                    continue;
                }
                // Get the stats for the item
                const stats = yield fs_extra_1.default.stat(itemPath);
                // console.log(`file/directory: ${itemPath}`);
                if (stats.isDirectory()) {
                    // Recursively delete subdirectories
                    yield fs_extra_1.default.remove(itemPath);
                    // console.log(`Removed directory: ${itemPath}`);
                }
                else if (stats.isFile()) {
                    // Remove files
                    yield fs_extra_1.default.remove(itemPath);
                    // console.log(`Removed file: ${itemPath}`);
                }
            }
        }
        catch (error) {
            //@ts-ignore
            console.error(`Error emptying directory: ${error.message}`);
        }
    });
}
