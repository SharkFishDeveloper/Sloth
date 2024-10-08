"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    if (allFilesAndFolders.length === 0) {
        // If the directory is empty, add the directory path to the response
        response.push(folderPath);
    }
    else {
        allFilesAndFolders.forEach(file => {
            const fullFilePath = path_1.default.join(folderPath, file);
            if (fs_1.default.statSync(fullFilePath).isDirectory()) {
                // Recursively get files and directories
                response = response.concat((0, exports.getAllFiles)(fullFilePath));
            }
            else {
                response.push(fullFilePath);
            }
        });
    }
    const gitRegex = /\.git(\\|\/)/;
    response = response.filter(file => !file.includes("node_mod") && !file.match(gitRegex) && !file.includes("dist"));
    return response;
};
exports.getAllFiles = getAllFiles;
