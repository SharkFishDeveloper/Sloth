#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const dirCompare = __importStar(require("dir-compare"));
const cli_color_1 = __importDefault(require("cli-color"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const klaw_1 = __importDefault(require("klaw"));
const zlib_1 = __importDefault(require("zlib"));
// import linereader from "line-reader"
var configPath = path_1.default.join(process.cwd(), "/.gitpulse/config.json");
class Gitpulse {
    constructor() {
        this.rootpath = '';
        this.gitpath = '';
        this.objPath = "";
        this.stagingPath = "";
        this.commitsPath = "";
        this.configPath = "";
        this.head = "";
        this.currentHead = "";
        this.cwd = "";
        this.branchesPath = "";
        this.currentBranchName = "";
        this.mainCommitsIdOnly = "";
        this.initiaStartingTime = "";
        this.branchingObjectsPath = "";
        this.rootpath = path_1.default.join(process.cwd());
        this.gitpath = path_1.default.join(this.rootpath, ".gitpulse");
        this.objPath = path_1.default.join(this.gitpath, "obj");
        this.stagingPath = path_1.default.join(this.gitpath, "staging");
        this.commitsPath = path_1.default.join(this.gitpath, "commits.txt");
        this.head = path_1.default.join(this.gitpath, "HEAD.txt");
        this.currentHead = path_1.default.join(this.gitpath, "CURRENT.txt");
        this.branchesPath = path_1.default.join(this.gitpath, "BRANCHES.json");
        this.currentBranchName = path_1.default.join(this.gitpath, "CURRENTBRANCH.txt");
        this.mainCommitsIdOnly = path_1.default.join(this.gitpath, "MAIN_COMMITS.txt");
        this.initiaStartingTime = path_1.default.join(this.gitpath, "INITIAL_TIME.txt");
        this.branchingObjectsPath = path_1.default.join(this.gitpath, "Branch_modifications");
        if (!fs_1.default.existsSync(path_1.default.join(this.gitpath))) {
            console.log("No git directory exists");
        }
        this.cwd = path_1.default.join(process.cwd(), "../");
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitExists = fs_1.default.existsSync(this.gitpath);
            if (!gitExists) {
                try {
                    fs_1.default.mkdir(this.gitpath, { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.mkdir(path_1.default.join(this.gitpath, "cmpA"), { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.mkdir(path_1.default.join(this.gitpath, "Branch_modifications"), { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.writeFileSync(this.commitsPath, "");
                    fs_1.default.writeFileSync(this.head, "");
                    fs_1.default.writeFileSync(this.currentHead, "");
                    fs_1.default.writeFileSync(this.branchesPath, "");
                    fs_1.default.writeFileSync(this.currentBranchName, "main");
                    fs_1.default.writeFileSync(this.mainCommitsIdOnly, "");
                    fs_1.default.mkdir(this.stagingPath, { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.mkdir(path_1.default.join(this.objPath, "init"), { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.mkdir(`${this.objPath}/init`, { recursive: true }, (err) => {
                        console.log(err);
                    });
                    console.log(cli_color_1.default.greenBright("Ininitialized empty .gitpulse successfully"));
                }
                catch (error) {
                    console.log(error);
                }
            }
            else {
                // console.log(clc.bgGreenBright(clc.black("Already ininitialized .gitpulse")));
                // setInterval(() => this.deleteWasteFilesInStaging(), 15000);
                // console.log(".gitpulse aleady exists");
            }
        });
    }
    static loadFromConfig() {
        if (fs_1.default.existsSync(configPath)) {
            return new Gitpulse();
        }
        return null;
    }
    saveToConfig() {
        const config = {
            fileName: process.cwd(),
        };
        fs_1.default.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
    }
    filesDirectory() {
        return new Promise((resolve, reject) => {
            const directories = [];
            console.log(path_1.default.join(this.cwd));
            (0, klaw_1.default)(path_1.default.join(this.cwd))
                .on('data', (item) => {
                // console.log(">>>>",item)
                if (item.path.includes("sloth") || item.path.includes(".git")) {
                }
                else if (item.stats.isDirectory()) {
                    fs_1.default.readdir(item.path, (err, files) => {
                        if (files.length === 0) {
                            directories.push(item.path);
                        }
                    });
                }
                else if (item.stats.isFile()) {
                    directories.push(item.path);
                }
            })
                .on('error', (err) => {
                reject(err);
            })
                .on('end', () => {
                // console.log(directories);
                resolve(directories);
            });
        });
    }
    stagedDirectoryFiles() {
        return new Promise((resolve, reject) => {
            const directories = [];
            (0, klaw_1.default)(path_1.default.join(this.stagingPath))
                .on('data', (item) => {
                if (item.stats.isDirectory()) {
                    //! fine is it {recursive}?
                    fs_1.default.readdir(item.path, { recursive: true }, (err, files) => {
                        console.log("DIRECTOR", item.path, files);
                        if (files.length === 0) {
                            directories.push(item.path);
                        }
                    });
                }
                else if (item.stats.isFile()) {
                    directories.push(item.path);
                }
            })
                .on('error', (err) => {
                reject(err);
            })
                .on('end', () => {
                // console.log(directories);
                resolve(directories);
            });
        });
    }
    filesDirectoryToStageEverything() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const files = fs_1.default.readdir(this.cwd, (err, files) => {
                    if (err) {
                        console.error('Error reading directory:', err);
                        reject(err);
                    }
                    const filteredFiles = files.filter(file => {
                        const fileName = file;
                        return !fileName.startsWith('sloth') &&
                            !fileName.includes('.git') &&
                            !fileName.includes('.gitpulse') &&
                            !fileName.includes('node_modules') &&
                            !fileName.includes('package');
                        // &&
                        // !fileName.startsWith('tsconfig') &&
                        // !fileName.startsWith('src') &&
                        // !fileName.startsWith('dist');
                    });
                    resolve(filteredFiles);
                });
            });
        });
    }
    checkUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            //! very inefficient
            let filesDirectory = yield this.filesDirectory();
            // console.log("FILES in DIRECTORY : ",filesDirectory);
            filesDirectory = filesDirectory.map((file) => {
                return file.substring(this.cwd.length);
            });
            //! ERROR
            const untrackedFiles = [];
            const modifiedFiles = [];
            filesDirectory === null || filesDirectory === void 0 ? void 0 : filesDirectory.map((file => {
                const stagingfilePath = path_1.default.join(this.stagingPath, file);
                const dirfilePath = path_1.default.join(this.cwd, file);
                if (fs_1.default.existsSync(stagingfilePath)) {
                    try {
                        const contentFileDir = fs_1.default.readFileSync(stagingfilePath, "utf-8");
                        const contentFileStaging = fs_1.default.readFileSync(dirfilePath, "utf-8");
                        if (contentFileDir !== contentFileStaging) {
                            modifiedFiles.push(file);
                        }
                    }
                    catch (error) {
                    }
                }
                else {
                    untrackedFiles.push(file);
                }
            }));
            if (untrackedFiles.length > 0) {
                console.log(cli_color_1.default.whiteBright("Use git add . or git add <file> to add to staging area"));
            }
            untrackedFiles.forEach((file) => {
                console.log(cli_color_1.default.red(`Untracked file -> ${file}`));
            });
            modifiedFiles.forEach((file) => {
                console.log(cli_color_1.default.yellow(`Modified file -> ${file.replace(/\\/g, "/")}`));
            });
            if (untrackedFiles.length === 0 && modifiedFiles.length === 0) {
                console.log(cli_color_1.default.greenBright("Everything is up to date"));
            }
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkUpdates();
        });
    }
    add(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file === ".") {
                yield fs_extra_1.default.emptyDir(this.stagingPath);
                const filesDir = yield this.filesDirectoryToStageEverything();
                const pathnew = this.cwd;
                filesDir.forEach((files) => __awaiter(this, void 0, void 0, function* () {
                    yield this.copyDirectory(path_1.default.join(pathnew, files), path_1.default.join(this.stagingPath, files))
                        .then(() => console.log(''))
                        .catch(err => console.error(''));
                }));
                console.log(cli_color_1.default.green("Added all the files to staging area"));
                console.log(cli_color_1.default.greenBright("Everything is staged"));
            }
            else {
                var filePath = path_1.default.join(this.cwd, file);
                // console.log(filePath);
                const stats = fs_1.default.existsSync(filePath);
                //fs.existsSync(filePath) ? fs.statSync(file) : null;
                if (!stats) {
                    return console.log(cli_color_1.default.magentaBright(`${file} does not exist in ${filePath}`));
                }
                else {
                    // console.log("EXists",filePath,path.join(this.stagingPath))
                }
                this.copyDirectory(filePath, path_1.default.join(this.stagingPath, file));
                console.log(cli_color_1.default.green(`Added ${file} to staging area`));
            }
        });
    }
    readDirectory(directoryPath, file, pathData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = fs_1.default.readdirSync(directoryPath, { withFileTypes: true });
                for (const item of items) {
                    // console.log("-->",directoryPath,file,item.name,pathData);
                    var fullPath = path_1.default.join(directoryPath, item.name);
                    fullPath = fullPath.replace(/\\/g, '/');
                    const index = fullPath.indexOf(file);
                    if (item.isDirectory()) {
                        console.log("D");
                        yield this.readDirectory(fullPath, file, pathData);
                    }
                    else if (item.isFile()) {
                        console.log("F");
                        const content = fs_1.default.readFileSync(fullPath, "utf-8");
                        const pathindex = fullPath.slice(index);
                        // console.log(`Path:${fullPath.slice(index)}`);
                        // console.log(`File: ${fullPath}`);
                        // console.log(`Content: ${content}`);
                        var firstPath = "";
                        if (!fs_1.default.existsSync(path_1.default.join(this.stagingPath, pathindex))) {
                            console.log("Does not Ex");
                            const lindex = pathindex.lastIndexOf("/");
                            const firstPart = pathindex.slice(0, lindex);
                            const filename = pathindex.slice(lindex);
                            console.log("First part", firstPart);
                            firstPath = pathData === "staging" ? path_1.default.join(this.stagingPath, firstPart) : pathData;
                            console.log("FIRST PATH", firstPath);
                            // console.log("Does not exts in OBJ",firstPart,lindex,filename);
                            // try {
                            //   fs.mkdirSync(firstPath, { recursive: true });
                            // } catch (error) {
                            //   console.log("ERROR ####",error)
                            // }
                            // console.log("Content",content);
                            try {
                                fs_1.default.writeFileSync(path_1.default.join(firstPath, filename), content);
                            }
                            catch (error) {
                                console.log("Already added to stage area");
                            }
                        }
                        else {
                            console.log("Exists");
                            console.log("FIRST PATH", firstPath);
                            const lindex = pathindex.lastIndexOf("/");
                            const firstPart = pathindex.slice(0, lindex);
                            const filename = pathindex.slice(lindex);
                            const firstPathQ = pathData === "staging" ? path_1.default.join(this.stagingPath, firstPart) : pathData;
                            console.log("staging data", firstPathQ);
                            try {
                                fs_1.default.writeFileSync(path_1.default.join(firstPathQ, filename), content);
                            }
                            catch (error) {
                                console.log("->>>>>>", error);
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error reading directory: ${error}`);
            }
        });
    }
    commit(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const currentBranchName = fs_1.default.readFileSync(this.currentBranchName, "utf-8");
            if (currentBranchName !== "main") {
                yield this.branchCommits(message);
                return;
            }
            console.log("Commit Message : ", message);
            const commitDataPath = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            // const commitDataMAIN: string = fs.readFileSync(this.mainCommitsIdOnly, "utf-8");
            const lines = commitDataPath.split('\n').filter(line => line !== '');
            const pathStage = [];
            const stagedFiles = [];
            if (lines.length === 0) {
                console.log(commitDataPath);
                try {
                    const files = yield new Promise((resolve, reject) => {
                        fs_1.default.readdir(this.stagingPath, (err, files) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(files);
                            }
                        });
                    });
                    stagedFiles.push(...files);
                    fs_1.default.writeFileSync(this.initiaStartingTime, `${new Date()}\n${message}`);
                }
                catch (err) {
                    // console.error("Error reading staging directory:", err);
                }
                // console.log("stagedFiles",stagedFiles)
                stagedFiles.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                    // const a = pathStage.push(path.join(this.stagingPath, file));
                    // const path1 = (path.join(this.cwd, "Git-pulse/.gitpulse", "staging"));
                    yield this.copyDirectory(this.stagingPath, path_1.default.join(this.objPath, "init"))
                        .then(() => console.log(''))
                        .catch(err => console.error('Error during copy operation:', err));
                }));
                fs_1.default.writeFileSync(this.commitsPath, `\n${message}:init:${new Date()}`);
                fs_1.default.writeFileSync(this.mainCommitsIdOnly, `init`);
                fs_1.default.writeFileSync(this.head, "init");
                fs_1.default.writeFileSync(this.currentHead, "init");
            }
            //START FROM HERE
            else if (lines.length == 1) {
                const randomBytes = crypto_1.default.randomBytes(20);
                const newCommitId = randomBytes.toString('hex');
                const newCommitIdpath = path_1.default.join(this.objPath, newCommitId);
                fs_1.default.mkdirSync(newCommitIdpath);
                fs_1.default.mkdirSync(path_1.default.join(newCommitIdpath, "mdf"));
                fs_1.default.writeFileSync(path_1.default.join(newCommitIdpath, "ad.txt"), "");
                fs_1.default.writeFileSync(path_1.default.join(newCommitIdpath, "rm.txt"), "");
                try {
                    const result = yield dirCompare.compare(this.stagingPath, path_1.default.join(this.objPath, "init"), { compareContent: true });
                    var modifiedFiles = [];
                    const addedFiles = [];
                    const deletedFiles = [];
                    (_a = result.diffSet) === null || _a === void 0 ? void 0 : _a.forEach((diff, index) => {
                        if (diff.state === "left") {
                            const isFile = (path) => /.+\.[a-zA-Z0-9]+$/.test(path);
                            let diffpath1 = diff.path1;
                            console.log("File PATH TO ADD FOCUS ON THIS ->", path_1.default.join(diffpath1, diff.name1));
                            let initialName = path_1.default.join(diffpath1, diff.name1);
                            if (isFile(initialName)) {
                                console.log(`${path_1.default} is a file`);
                                const fileData = fs_1.default.readFileSync(initialName, "utf-8");
                                if (fileData !== null) {
                                    let a = path_1.default.join(this.cwd, diffpath1.split("staging")[1]);
                                    //a is final path
                                    //diff path1 is staging file path
                                    const data = `${path_1.default.join(a, diff.name1)}\n${fileData}`;
                                    modifiedFiles === null || modifiedFiles === void 0 ? void 0 : modifiedFiles.push(path_1.default.join(a, diff.name1));
                                    addedFiles === null || addedFiles === void 0 ? void 0 : addedFiles.push(path_1.default.join(a, diff.name1));
                                    zlib_1.default.gzip(data, (err, compressedData) => {
                                        if (err) {
                                            console.error('Error compressing data:', err);
                                            return;
                                        }
                                        const filePath = path_1.default.join(newCommitIdpath, "mdf", `${index}.txt.gz`);
                                        fs_1.default.writeFile(filePath, compressedData, (err) => {
                                            if (err) {
                                                console.error('Error writing compressed data to file:', err);
                                            }
                                            else {
                                                console.log('Compressed data successfully written to', filePath);
                                            }
                                        });
                                        fs_1.default.appendFileSync(path_1.default.join(newCommitIdpath, "ad.txt"), `\n${path_1.default.join(a, diff.name1)}`);
                                    });
                                }
                                else if (fileData === null) {
                                    let a = path_1.default.join(this.cwd, diffpath1.split("staging")[1]);
                                    addedFiles === null || addedFiles === void 0 ? void 0 : addedFiles.push(path_1.default.join(a, diff.name1));
                                    fs_1.default.appendFileSync(path_1.default.join(newCommitIdpath, "ad.txt"), `\n${path_1.default.join(a, diff.name1)}`);
                                }
                            }
                            else {
                                console.log(`${path_1.default} is a directory`);
                                let a = path_1.default.join(this.cwd, diffpath1.split("staging")[1]);
                                addedFiles === null || addedFiles === void 0 ? void 0 : addedFiles.push(path_1.default.join(a, diff.name1));
                                fs_1.default.appendFileSync(path_1.default.join(newCommitIdpath, "ad.txt"), `\n${path_1.default.join(a, diff.name1)}`);
                            }
                        }
                        else if (diff.state === "distinct") {
                            let diffpath1 = diff.path1;
                            let a = path_1.default.join(this.cwd, diffpath1.split("staging")[1]);
                            try {
                                const pathStaging = path_1.default.join(diff.path1, diff.name1);
                                const pathObj = path_1.default.join(diff.path2, diff.name2);
                                const data1 = fs_1.default.readFileSync(pathStaging, "utf-8");
                                const data2 = fs_1.default.readFileSync(pathObj, "utf-8");
                                const readingStg = fs_1.default.readFileSync(path_1.default.join(diffpath1, diff.name1), "utf-8");
                                const data = `${path_1.default.join(a, diff.name1)}\n${readingStg}`;
                                //! is it right ???
                                zlib_1.default.gzip(data, (err, compressedData) => {
                                    if (err) {
                                        console.error('Error compressing data:', err);
                                        return;
                                    }
                                    const filePath = path_1.default.join(newCommitIdpath, "mdf", `${index}.txt.gz`);
                                    fs_1.default.writeFile(filePath, compressedData, (err) => {
                                        if (err) {
                                            console.error('Error writing compressed data to file:', err);
                                        }
                                        else {
                                            console.log('Compressed data successfully written to', filePath);
                                        }
                                    });
                                });
                            }
                            catch (error) {
                                console.log(error);
                            }
                            //! or use simple text copy,paste
                            modifiedFiles === null || modifiedFiles === void 0 ? void 0 : modifiedFiles.push(path_1.default.join(a, diff.name1));
                            console.log("Modified content", path_1.default.join(diff.path1, diff.name1));
                        }
                        else if (diff.state === "right") {
                            let diffpath2 = diff.path2;
                            let a = path_1.default.join(this.cwd, diffpath2.split("init")[1]);
                            fs_1.default.appendFileSync(path_1.default.join(newCommitIdpath, "rm.txt"), `\n${path_1.default.join(a, diff.name2)}`);
                            deletedFiles === null || deletedFiles === void 0 ? void 0 : deletedFiles.push(path_1.default.join(a, diff.name2));
                            // console.log("Deleted files",path.join(diff.path2 as string,diff.name2 as string)); 
                        }
                    });
                    console.log("M", modifiedFiles);
                    console.log("A", addedFiles);
                    console.log("D", deletedFiles);
                }
                catch (error) {
                    console.error("Error comparing directories:", error);
                }
                fs_1.default.appendFileSync(this.commitsPath, `\n${message}:${newCommitId}:${new Date()}`);
                fs_1.default.appendFileSync(this.mainCommitsIdOnly, `\n${newCommitId}`);
                fs_1.default.writeFileSync(this.head, newCommitId);
                fs_1.default.writeFileSync(this.currentHead, newCommitId);
            }
            else if (lines.length >= 2) {
                fs_1.default.mkdir(path_1.default.join(this.gitpath, "diff"), { recursive: true }, (err) => {
                    console.log(err);
                });
                console.log("I am working");
                yield this.copyDirectory(path_1.default.join(this.objPath, "init"), path_1.default.join(this.gitpath, "diff"));
                const arr = lines;
                arr.shift();
                let reverseCommitsId = arr;
                // reverseCommitsId.pop(); 
                reverseCommitsId.forEach((id) => {
                    const startI = id.indexOf(":") + 1;
                    const endI = 40 + id.indexOf(":") + 1;
                    id = id.substring(startI, endI);
                    const addFilePath = path_1.default.join(this.objPath, id, "ad.txt");
                    let addedFiles = fs_1.default.readFileSync(addFilePath, "utf-8");
                    const addedFilesArray = addedFiles.split("\n").filter(line => line !== '');
                    const deleteFilePath = path_1.default.join(this.objPath, id, "rm.txt");
                    let deletedFiles = fs_1.default.readFileSync(deleteFilePath, "utf-8");
                    addedFilesArray.forEach((file) => {
                        const fileName = file.substring(this.cwd.length);
                        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
                        try {
                            if (!fileExtensionRegex.test(fileName)) {
                                fs_1.default.mkdirSync(path_1.default.join(this.gitpath, "diff", fileName));
                            }
                            else {
                                fs_1.default.writeFileSync(path_1.default.join(this.gitpath, "diff", fileName), "");
                            }
                        }
                        catch (error) {
                        }
                    });
                    const deletedFilesArray = deletedFiles.split("\n").filter(line => line !== '');
                    deletedFilesArray.forEach((file) => {
                        const fileName = file.substring(this.cwd.length);
                        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
                        if (!fileExtensionRegex.test(fileName)) {
                            console.log("DEL dir", fileName);
                            fs_1.default.promises.rm(path_1.default.join(this.gitpath, "diff", fileName), { recursive: true, force: true });
                        }
                        else {
                            console.log("DEL file", fileName);
                            fs_1.default.unlinkSync(path_1.default.join(this.gitpath, "diff", fileName));
                        }
                    });
                    var filesCount;
                    const mdfPath = path_1.default.join(this.objPath, id, "mdf");
                    fs_1.default.readdir(mdfPath, (err, files) => {
                        if (files.length === 0) {
                            filesCount = 0;
                            //&& addedFilesArray.length===0 && deletedFilesArray.length===0
                            return;
                        }
                        files.forEach((file) => {
                            const pathC = path_1.default.join(mdfPath, file);
                            const compressedData = fs_1.default.readFileSync(pathC);
                            // const apth = `${path.join(a, diff.name1 as string)}\n${readingStg}`
                            //!`${path.join(a, diff.name1 as string)}\n${readingStg}`
                            const decompressedData = zlib_1.default.gunzipSync(compressedData);
                            const content = decompressedData.toString('utf8');
                            const newlineIndex = content.indexOf('\n');
                            if (newlineIndex === -1) {
                            }
                            const firstLine = content.substring(0, newlineIndex);
                            const remainingContent = content.substring(newlineIndex + 1);
                            const filePath = firstLine.substring(this.cwd.length);
                            fs_1.default.writeFileSync(path_1.default.join(this.gitpath, "diff", filePath), remainingContent);
                            console.log("F", "R", remainingContent);
                        });
                    });
                    if (filesCount === 0 && addedFilesArray.length === 0 && deletedFilesArray.length === 0) {
                        return console.log(cli_color_1.default.greenBright("Nothing to commit,working tree clean"));
                    }
                });
                const randomBytes = crypto_1.default.randomBytes(20);
                const newCommitId = randomBytes.toString('hex');
                const newCommitIdpath = path_1.default.join(this.objPath, newCommitId);
                fs_1.default.mkdirSync(newCommitIdpath);
                fs_1.default.mkdirSync(path_1.default.join(newCommitIdpath, "mdf"));
                fs_1.default.writeFileSync(path_1.default.join(newCommitIdpath, "ad.txt"), "");
                fs_1.default.writeFileSync(path_1.default.join(newCommitIdpath, "rm.txt"), "");
                yield this.commpare2directoriesDiff(path_1.default.join(this.stagingPath, "/"), path_1.default.join(this.gitpath, "diff", "/"), newCommitId, message);
                fs_1.default.writeFileSync(this.head, newCommitId);
                fs_1.default.writeFileSync(this.currentHead, newCommitId);
                fs_extra_1.default.remove(path_1.default.join(this.gitpath, "diff"));
            }
        });
    }
    //TODO : Already have added,deleted and Modified arrays for both 1 commit and multiple commits , write this data to a json file for that objID 
    commpare2directoriesDiff(sourceDir, outDir, newCommitId, message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const modifiedFiles = [];
            const addedFiles = [];
            const deletedFiles = [];
            try {
                const difference = yield dirCompare.compare(sourceDir, outDir, { compareContent: true });
                const objpath = path_1.default.join(this.objPath, newCommitId);
                // console.log("SRC",sourceDir,"ROOT",outDir,"===>",objpath);
                (_a = difference.diffSet) === null || _a === void 0 ? void 0 : _a.forEach((diff, index) => {
                    if (diff.state === "left" && diff.path1 && diff.name1) {
                        let diffpath1 = diff.path1;
                        let a = path_1.default.join(this.cwd, diffpath1.split("staging")[1]);
                        const isFile = (path) => /.+\.[a-zA-Z0-9]+$/.test(path);
                        console.log("DIFFPATH1", diffpath1);
                        let initialName = path_1.default.join(diffpath1, diff.name1);
                        if (isFile(initialName)) {
                            console.log("IT is a file", initialName);
                            const initialdata = fs_1.default.readFileSync(initialName, "utf-8");
                            const data = `${path_1.default.join(a, diff.name1)}\n${initialdata}`;
                            zlib_1.default.gzip(data, (err, compressedData) => {
                                if (err) {
                                    console.error('Error compressing data:', err);
                                    return;
                                }
                                const filePath = path_1.default.join(objpath, "mdf", `${index}.txt.gz`);
                                fs_1.default.writeFile(filePath, compressedData, (err) => {
                                    if (err) {
                                        // console.error('Error writing compressed data to file:', err);
                                    }
                                    else {
                                        // console.log('Compressed data successfully written to', filePath);
                                    }
                                });
                            });
                            diffpath1 = diffpath1.substring(this.stagingPath.length);
                            const pushedFile = path_1.default.join(this.cwd, diffpath1, diff.name1);
                            addedFiles.push(pushedFile);
                            fs_1.default.appendFileSync(path_1.default.join(objpath, "ad.txt"), `\n${pushedFile}`);
                        }
                        else {
                            diffpath1 = diffpath1.substring(this.stagingPath.length);
                            const pushedFile = path_1.default.join(this.cwd, diffpath1, diff.name1);
                            addedFiles.push(pushedFile);
                            fs_1.default.appendFileSync(path_1.default.join(objpath, "ad.txt"), `\n${pushedFile}`);
                        }
                    }
                    else if (diff.state === "distinct" && diff.path1 && diff.name1) {
                        let diffpath1 = diff.path1;
                        diffpath1 = diffpath1.substring(this.stagingPath.length);
                        modifiedFiles.push(path_1.default.join(this.cwd, diffpath1, diff.name1));
                        const stagedPathtoread = path_1.default.join(this.stagingPath, diffpath1, diff.name1);
                        let data = fs_1.default.readFileSync(stagedPathtoread, "utf-8");
                        let apth = stagedPathtoread.substring(this.stagingPath.length);
                        apth = path_1.default.join(this.cwd, apth);
                        data = `${apth}\n${data}`;
                        zlib_1.default.gzip(data, (err, compressedData) => {
                            if (err) {
                                console.error('Error compressing data:', err);
                                return;
                            }
                            const filePath = path_1.default.join(objpath, "mdf", `${index}.txt.gz`);
                            fs_1.default.writeFile(filePath, compressedData, (err) => {
                                if (err) {
                                    // console.error('Error writing compressed data to file:', err);
                                }
                                else {
                                    // console.log('Compressed data successfully written to', filePath);
                                }
                            });
                        });
                    }
                    else if (diff.state === "right" && diff.path2 && diff.name2) {
                        let diffpath2 = diff.path2;
                        let newP = path_1.default.join(this.gitpath, "diff");
                        diffpath2 = diffpath2.substring(newP.length);
                        const pushedFile = path_1.default.join(this.cwd, diffpath2, diff.name2);
                        deletedFiles.push(pushedFile);
                        fs_1.default.appendFileSync(path_1.default.join(objpath, "rm.txt"), `\n${pushedFile}`);
                    }
                });
                if (modifiedFiles.length === 0 && addedFiles.length === 0 && deletedFiles.length === 0) {
                    const newCommitIdpath = path_1.default.join(this.objPath, newCommitId);
                    fs_extra_1.default.remove(newCommitIdpath);
                    return console.log(cli_color_1.default.green("Working tree clean, nothing to commit"));
                }
                fs_1.default.appendFileSync(this.commitsPath, `\n${message}:${newCommitId}:${new Date()}`);
                fs_1.default.appendFileSync(this.mainCommitsIdOnly, `\n${newCommitId}`);
                // console.log("MODIFIED FILES",modifiedFiles);
                // console.log("ADDED FILES",addedFiles);
                // console.log("DELETED FILES",deletedFiles);
            }
            catch (error) {
                const newCommitIdpath = path_1.default.join(this.objPath, newCommitId);
                fs_extra_1.default.remove(newCommitIdpath);
                console.log("Derror", error);
            }
        });
    }
    log(branch) {
        if (branch === "main") {
            let currentHead = fs_1.default.readFileSync(this.currentHead, "utf-8").trim();
            let data = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            let show = data.split("\n").filter(line => line !== "").reverse();
            console.log(cli_color_1.default.bgWhite(cli_color_1.default.black(`Commit logs for ${cli_color_1.default.red("Tree")}/${cli_color_1.default.green(`${branch}`)}`)));
            show.forEach((data) => {
                const m = data.split(":");
                const gmtIndex = m[4].indexOf("GMT");
                const time = m[2] + ":" + m[3] + ":" + m[4].substring(0, gmtIndex);
                console.log(`${cli_color_1.default.yellow("message ->")} ${m[0]}\t` +
                    `${cli_color_1.default.whiteBright("ID ->")} ${m[1]} ` +
                    `${m[1] === currentHead ? cli_color_1.default.green("<- CURRENT-HEAD") : ''}\n` +
                    `${cli_color_1.default.yellow("Commited on ->")} ${time}`);
            });
            console.log(cli_color_1.default.bgWhite(cli_color_1.default.black(`<- END ->`)));
        }
        else {
            console.log("LOG FOR BRANCH->", branch);
        }
    }
    migrateToCommitInMain(commitId, srcDest) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = fs_1.default.readFileSync(this.currentHead, "utf-8");
            if (current === commitId && !srcDest.includes("cmpA")) {
                return console.log(cli_color_1.default.greenBright(`You are already on ${commitId}`));
            }
            const migPath = srcDest;
            const dfiles = yield this.extractTopLevelDirectories();
            console.log("D", dfiles);
            try {
                if (!srcDest.includes("cmpA")) {
                    console.log("RMEOVING DIRECTORUES");
                    // return;
                    dfiles.forEach((del) => __awaiter(this, void 0, void 0, function* () {
                        fs_extra_1.default.removeSync(del);
                    }));
                }
                else {
                    console.log("Emptying cmpA");
                    fs_extra_1.default.mkdirSync(srcDest);
                }
                yield this.copyDirectory(path_1.default.join(this.objPath, "init"), migPath);
                console.log(path_1.default.join(this.objPath, "init"), migPath);
                // return;
            }
            catch (error) {
                console.log("ERROR", error);
            }
            if (commitId === "init") {
                fs_1.default.writeFileSync(this.currentHead, commitId);
                return;
            }
            const commitDataPath = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            const lines = commitDataPath.split('\n').filter(line => line !== '');
            //  if(!srcDest.includes("cmpA")){
            lines.shift();
            // if(srcDest.includes("cmpA")){
            //   lines.pop();
            // }
            //  }
            var Index = 5000000;
            for (const [index, id] of lines.entries()) {
                console.log("APPLYING CHANGES OF ->", id);
                if (index > Index) {
                    fs_1.default.writeFileSync(this.currentHead, commitId);
                    break;
                }
                const finalId = id.indexOf(":");
                const lastid = id.substring(finalId + 1, finalId + 41);
                if (lastid === commitId) {
                    Index = index;
                    console.log(`Commit ID ${lastid} found at line ${index + 1}`);
                }
                console.log("ID", lastid);
                const idc = lastid;
                const addFilePath = path_1.default.join(this.objPath, idc, "ad.txt");
                console.log("ADDED FILE PATH", addFilePath);
                let addedFiles = fs_1.default.readFileSync(addFilePath, "utf-8");
                const addedFilesArray = addedFiles.split("\n").filter(line => line !== '');
                addedFilesArray.forEach((file) => {
                    const fileName = file.substring(this.cwd.length);
                    const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
                    console.log("File to add ->", path_1.default.join(migPath, fileName));
                    try {
                        if (!fileExtensionRegex.test(fileName)) {
                            fs_1.default.mkdirSync(path_1.default.join(migPath, fileName));
                        }
                        else {
                            fs_1.default.writeFileSync(path_1.default.join(migPath, fileName), "");
                        }
                    }
                    catch (error) {
                    }
                });
                const mdfPath = path_1.default.join(this.objPath, idc, "mdf");
                fs_1.default.readdir(mdfPath, (err, files) => {
                    if (files.length === 0) {
                        return;
                    }
                    files.forEach((file) => {
                        const pathC = path_1.default.join(mdfPath, file);
                        console.log("PATHC", pathC);
                        const compressedData = fs_1.default.readFileSync(pathC);
                        const decompressedData = zlib_1.default.gunzipSync(compressedData);
                        const content = decompressedData.toString('utf8');
                        console.log("MOD content =>", content, "\n");
                        const newlineIndex = content.indexOf('\n');
                        if (newlineIndex === -1) {
                        }
                        if (srcDest.includes("cmpA")) {
                            const firstLine = content.substring(0, newlineIndex);
                            const remainingContent = content.substring(newlineIndex + 1);
                            let filePath = firstLine.substring(this.cwd.length);
                            // filePath = filePath.substring(this.cwd.length)
                            filePath = path_1.default.join(this.gitpath, "cmpA", filePath);
                            console.log("FILEPATH->", filePath, "firstLine", filePath);
                            fs_1.default.writeFileSync(filePath, remainingContent);
                        }
                        else {
                            const firstLine = content.substring(0, newlineIndex);
                            const remainingContent = content.substring(newlineIndex + 1);
                            const filePath = firstLine.substring(this.cwd.length);
                            console.log(content, "firstLine", firstLine, "filePath", filePath);
                            fs_1.default.writeFileSync(firstLine, remainingContent);
                        }
                    });
                });
                const deleteFilePath = path_1.default.join(this.objPath, idc, "rm.txt");
                let deletedFiles = fs_1.default.readFileSync(deleteFilePath, "utf-8");
                const deletedFilesArray = deletedFiles.split("\n").filter(line => line !== '');
                deletedFilesArray.forEach((file) => {
                    console.log("ATTENTION HERE _ >>>>", file);
                    const fileName = file.substring(this.cwd.length);
                    const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
                    if (!fileExtensionRegex.test(fileName)) {
                        console.log("DEL dir", fileName);
                        fs_extra_1.default.remove(path_1.default.join(migPath, fileName));
                        // fs.promises.rm(path.join(migPath,fileName),{recursive:true,force:true})
                    }
                    else {
                        console.log("DEL file", fileName);
                        fs_extra_1.default.remove(path_1.default.join(migPath, fileName));
                    }
                });
            }
            fs_1.default.writeFileSync(this.currentHead, commitId);
        });
    }
    extractTopLevelDirectories() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const read = fs_1.default.readdir(this.cwd, (err, files) => {
                    if (err) {
                        console.log(err);
                    }
                    const filesR = files;
                    const fullPaths = files
                        .filter(file => !file.includes("sloth") && !file.includes(".git"))
                        .map(file => path_1.default.join(this.cwd, file));
                    return resolve(fullPaths);
                });
            });
        });
    }
    copyDirectory(sourceDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_extra_1.default.copy(sourceDir, destDir, {
                    overwrite: true, // Overwrites the content if it already exists
                    errorOnExist: true // Don't throw an error if the destination exists
                });
                // console.log(`Copied from ${sourceDir} to ${destDir}`);
            }
            catch (error) {
                // console.error(`Error copying directory: ${error}`);
            }
        });
    }
    deleteCommitFromMain(commitid) {
        return __awaiter(this, void 0, void 0, function* () {
            const commits = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            const commitArray = commits.split("\n").filter(line => line !== "");
            // const reverseCommitArray = commitArray.reverse();
            // commitArray.pop();
            console.log("commits", commits);
            var commitDelete = [];
            var commitDeleteFilesReverse = [];
            for (let i = 0; i < commitArray.length; i++) {
                const id = commitArray[i];
                const lindex = id.indexOf(":");
                const idCorrected = id.substring(lindex + 1, lindex + 41);
                if (idCorrected === commitid) {
                    console.log("We meet", commitid, ">>", idCorrected, "INDEX", i + 1);
                    break;
                }
                else {
                    try {
                        commitDeleteFilesReverse.push(path_1.default.join(commitArray[commitArray.length - i + 1]));
                        // console.log("RMEOVE->",(path.join(commitArray[commitArray.length - i])));
                        commitDelete.push(commitArray[i]);
                        // fsExtra.remove(path.join(this.objPath,));
                    }
                    catch (error) {
                    }
                }
                console.log("DELETE FILES->", commitDeleteFilesReverse);
            }
            const commitsText = commitDelete.join('\n');
            try {
                // fs.writeFileSync(this.commitsPath,commitsText);
            }
            catch (error) {
            }
        });
    }
    checkout(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            let timeNmessage = fs_1.default.readFileSync(this.initiaStartingTime, "utf-8");
            const timeDataInitially = timeNmessage.split("\n").filter(line => line !== "");
            const currentBranchName = fs_1.default.readFileSync(this.currentBranchName, "utf-8");
            let mainCommitIds = fs_1.default.readFileSync(this.mainCommitsIdOnly, "utf-8");
            const mainIds = mainCommitIds.split("\n").filter(line => line !== "");
            const currentHead = fs_1.default.readFileSync(this.currentHead, "utf-8").trim();
            if (currentBranchName === branchName) {
                return console.log(cli_color_1.default.blueBright(`You are already on ${branchName}`));
            }
            else if (mainIds.length === 0 || mainIds[0] === "") {
                return console.log(cli_color_1.default.redBright("You need to commit initially "));
            }
            else {
                let branchcommitsHistory = fs_1.default.readFileSync(this.branchesPath, "utf-8");
                let parsedJSONdata = {};
                try {
                    if (parsedJSONdata !== null) {
                        parsedJSONdata = JSON.parse(branchcommitsHistory);
                    }
                    console.log("mainIds----------");
                }
                catch (err) {
                    //! log error here
                    // console.error('Error parsing JSON:', err);
                    // return;
                }
                if (parsedJSONdata !== null && parsedJSONdata[branchName]) {
                    return console.log(cli_color_1.default.yellow("A branch with this name is already present"));
                }
                const commitMessageMain = fs_1.default.readFileSync(this.commitsPath, "utf-8");
                const commitMessageMainArrays = commitMessageMain.split("\n").filter(line => line !== "");
                let commitMessage = [];
                const result = {
                    [`${branchName}`]: {}
                };
                for (let i = 0; i < commitMessageMainArrays.length; i++) {
                    const id = commitMessageMainArrays[i];
                    const message = id.split(":");
                    const commitId = message[1]; // Extracting the commit ID
                    const commitMessage = message[0]; // Extracting the commit message
                    if (currentHead !== commitId) {
                        result[branchName][commitId] = {
                            time: message[2] + ":" + message[3],
                            message: commitMessage
                        };
                    }
                    else if (currentHead === commitId) {
                        result[branchName][commitId] = {
                            time: message[2] + ":" + message[3],
                            message: "MAIN" + commitMessage
                        };
                        break;
                    }
                    console.log("C", currentHead, "COMMIDTD", commitId);
                }
                console.log("result->", result);
                console.log("MESSAGE MAIN COMMITS", commitMessage);
                if (parsedJSONdata === null) {
                    fs_1.default.writeFileSync(this.branchesPath, JSON.stringify(result, null, 2), 'utf-8');
                }
                else {
                    const a = Object.assign(Object.assign({}, parsedJSONdata), result);
                    fs_1.default.writeFileSync(this.branchesPath, JSON.stringify(a, null, 2), 'utf-8');
                }
                if (currentBranchName === "main") {
                    this.checkoutToMain(currentHead, path_1.default.join(this.gitpath, "cmpA"));
                }
                fs_1.default.writeFileSync(this.currentBranchName, `${branchName}`);
                return;
                // let obj:BranchInterface = {
                //   [`${branchName}`]:{
                //   ["init"]:{
                //     time:timeDataInitially[0],
                //     message:timeDataInitially[1]
                //   }
                //   }
                // }
                // if(branchcommitsHistory===""){
                //   const obj:BranchInterface = {
                //     [`${branchName}`]:{
                //     ["init"]:{
                //       time:timeDataInitially[0],
                //       message:timeDataInitially[1]
                //     }
                //     }
                //   }
                //   fs.writeFileSync(this.branchesPath, JSON.stringify(obj, null, 2), 'utf-8');
                //   fs.writeFileSync(this.currentBranchName,`${branchName}`)
                //   return;
                // }
                // parsedJSONdata[`${branchName}`]  = {["init"]:{time:timeDataInitially[0],message:"init"}};
                // fs.writeFileSync(this.branchesPath, JSON.stringify(parsedJSONdata, null, 2), 'utf-8');
                // fs.writeFileSync(this.currentBranchName,`${branchName}`)
            }
            // this.checkoutmore()
        });
    }
    branchCommits(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("STARt");
            const distPath = path_1.default.join(this.gitpath, "cmpA"); //only change these names
            const srcPath = path_1.default.join(this.stagingPath, "/"); //only change these names
            const randomBytes = crypto_1.default.randomBytes(20);
            const newCommitId = randomBytes.toString('hex'); //create 40 digit hash 
            const difference = yield dirCompare.compare(srcPath, distPath, { compareContent: true });
            const addedFiles = [];
            const modifiedFiles = [];
            const deletedFiles = [];
            const objpath = path_1.default.join(this.branchingObjectsPath, newCommitId);
            fs_1.default.mkdirSync(objpath);
            fs_1.default.mkdirSync(path_1.default.join(objpath, "mdf"));
            fs_1.default.writeFileSync(path_1.default.join(objpath, "ad.txt"), "");
            fs_1.default.writeFileSync(path_1.default.join(objpath, "rm.txt"), "");
            (_a = difference.diffSet) === null || _a === void 0 ? void 0 : _a.forEach((diff, index) => {
                if (diff.state === "left" && diff.path1 && diff.name1) {
                    console.log("DIFF", diff.path1, diff.name1);
                    const stagingPath = path_1.default.join(diff.path1, diff.name1);
                    const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
                    if (!fileExtensionRegex.test(stagingPath)) {
                        let a = diff.path1.substring(this.stagingPath.length);
                        fs_1.default.appendFileSync(path_1.default.join(objpath, "ad.txt"), `\n${path_1.default.join(this.cwd, a, diff.name1)}`);
                        addedFiles.push(path_1.default.join(this.cwd, a, diff.name1));
                    }
                    else {
                        const pathToReadData = fs_1.default.readFileSync(stagingPath, "utf-8");
                        let a = diff.path1.substring(this.stagingPath.length);
                        const data = `${path_1.default.join(a, diff.name1)}\n${pathToReadData}`;
                        if (pathToReadData !== "") {
                            zlib_1.default.gzip(data, (err, compressedData) => {
                                if (err) {
                                    console.error('Error compressing data:', err);
                                    return;
                                }
                                const filePath = path_1.default.join(objpath, "mdf", `${index}.txt.gz`);
                                fs_1.default.writeFile(filePath, compressedData, (err) => {
                                    if (err) {
                                        // console.error('Error writing compressed data to file:', err);
                                    }
                                    else {
                                        // console.log('Compressed data successfully written to', filePath);
                                    }
                                });
                                console.log("added files -> ", `\n${path_1.default.join(this.cwd, a, diff.name1)}`);
                                fs_1.default.appendFileSync(path_1.default.join(objpath, "ad.txt"), `\n${path_1.default.join(this.cwd, a, diff.name1)}`);
                                addedFiles.push(path_1.default.join(this.cwd, a, diff.name1));
                            });
                        }
                        else {
                            fs_1.default.appendFileSync(path_1.default.join(objpath, "ad.txt"), `\n${path_1.default.join(this.cwd, a, diff.name1)}`);
                            addedFiles.push(path_1.default.join(this.cwd, a, diff.name1));
                        }
                    }
                }
                else if (diff.state === "distinct" && diff.path1 && diff.name1) {
                    const stagingPath = path_1.default.join(diff.path1, diff.name1);
                    const pathToReadData = fs_1.default.readFileSync(stagingPath, "utf-8");
                    let a = diff.path1.substring(this.stagingPath.length);
                    const data = `${path_1.default.join(a, diff.name1)}\n${pathToReadData}`;
                    zlib_1.default.gzip(data, (err, compressedData) => {
                        if (err) {
                            console.error('Error compressing data:', err);
                            return;
                        }
                        const filePath = path_1.default.join(objpath, "mdf", `${index}.txt.gz`);
                        fs_1.default.writeFile(filePath, compressedData, (err) => {
                            if (err) {
                                // console.error('Error writing compressed data to file:', err);
                            }
                            else {
                                // console.log('Compressed data successfully written to', filePath);
                            }
                        });
                        console.log("Mod files -> ", `\n${path_1.default.join(this.cwd, a, diff.name1)}`);
                    });
                    modifiedFiles.push(path_1.default.join(this.cwd, a, diff.name1));
                }
                else if (diff.state === "right" && diff.path2 && diff.name2) {
                    let diffpath2 = diff.path2;
                    let a = path_1.default.join(this.gitpath, "cmpA");
                    diffpath2 = diffpath2.substring(a.length);
                    const pushedFile = path_1.default.join(this.cwd, diffpath2, diff.name2);
                    const finalPath = path_1.default.join(diffpath2, diff.name2);
                    deletedFiles.push(pushedFile);
                    console.log("DEL", finalPath);
                    fs_1.default.appendFileSync(path_1.default.join(objpath, "rm.txt"), `\n${path_1.default.join(this.cwd, finalPath)}`);
                    deletedFiles.push(path_1.default.join(this.cwd, finalPath));
                }
            });
            if (modifiedFiles.length === 0 && addedFiles.length === 0 && deletedFiles.length === 0) {
                try {
                    console.log(addedFiles, modifiedFiles, deletedFiles);
                    fs_extra_1.default.removeSync(objpath);
                    return console.log("Nothing to commit, working tree clean");
                }
                catch (error) {
                    // console.log(error);
                }
            }
            else {
                try {
                    console.log("Listen");
                    const jsonBranchData = fs_1.default.readFileSync(this.branchesPath, "utf-8");
                    const branchName = fs_1.default.readFileSync(this.currentBranchName, "utf-8");
                    let parsedJson = JSON.parse(jsonBranchData);
                    parsedJson[branchName][newCommitId] = {
                        time: Date().toString(),
                        message: message
                    };
                    console.log(parsedJson);
                    fs_1.default.writeFileSync(this.branchesPath, JSON.stringify(parsedJson, null, 2), "utf-8");
                    fs_extra_1.default.emptydirSync(distPath);
                    yield this.copyDirectory(srcPath, distPath);
                }
                catch (error) {
                    console.log("->", error);
                }
            }
        });
    }
    checkoutToMain(commitId, pathName) {
        return __awaiter(this, void 0, void 0, function* () {
            fs_extra_1.default.removeSync(pathName);
            this.migrateToCommitInMain(commitId, pathName);
        });
    }
}
exports.default = Gitpulse;
function createHash({ data = "" }) {
    const hash = crypto_1.default.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
}
const program = new commander_1.Command();
let gitpulse;
const args = process.argv.slice(2);
program
    .command('status')
    .description('Check the status of the project')
    .action((options, command) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.status();
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('init')
    .description('Initialize Gitpulse in project')
    .action((options, command) => {
    gitpulse = new Gitpulse();
    gitpulse.saveToConfig();
});
program
    .command('log <branch>')
    .description('Show commit history')
    .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.log(branch);
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('migrate <commitId>')
    .description('Go back to previous commit')
    .action((commitId) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        const a = path_1.default.join(process.cwd(), "../");
        gitpulse.migrateToCommitInMain(commitId, a);
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('checkout <branch>')
    .description('Create a different branch')
    .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.checkout(branch);
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('delete <commitId>')
    .description('Delete main commit')
    .action((commitId) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        // console.log("commitId",commitId);
        gitpulse.deleteCommitFromMain(commitId);
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('commit <message>')
    .description('Commits the project')
    // .option('-m, --message <message>', 'Commit message')
    .action((message) => {
    console.log(message);
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse === null || gitpulse === void 0 ? void 0 : gitpulse.commit(message);
});
program.command('add <action>')
    .description("Add files to stage area")
    .action((action) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse === null || gitpulse === void 0 ? void 0 : gitpulse.add(action);
});
program.parse(process.argv);
