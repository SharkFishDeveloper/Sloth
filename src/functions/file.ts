import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string): string[] => {
    let response: string[] = [];
    const allFilesAndFolders = fs.readdirSync(folderPath);

    if (allFilesAndFolders.length === 0) {
        // If the directory is empty, add the directory path to the response
        response.push(folderPath);
    } else {
        allFilesAndFolders.forEach(file => {
            const fullFilePath = path.join(folderPath, file);
            if (fs.statSync(fullFilePath).isDirectory()) {
                // Recursively get files and directories
                response = response.concat(getAllFiles(fullFilePath));
            } else {
                response.push(fullFilePath);
            }
        });
    }

    const gitRegex = /\.git(\\|\/)/;
    response = response.filter(file => !file.includes("node_mod") && !file.match(gitRegex) && !file.includes("dist"));

    return response;
}
