import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import fsExtra from "fs-extra";

export async function zipFiles(files : string[]){
    let pathR = path.join(process.cwd(),"../");
    pathR = path.basename(pathR);
    await fsExtra.remove(path.join(process.cwd(),"../","pr.gzip"))
    const outputPath = path.join(process.cwd(),"../","pr.gzip");
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`Zip file created: ${outputPath} (${archive.pointer()} total bytes)`);
            // resolve();
        });

        archive.on('error', err => {
            reject(err);
        });

        archive.pipe(output);


        files.forEach(file => {
            const fileName = path.relative(process.cwd(), file);
            archive.file(fileName, { name: path.join(pathR,'Sloth', fileName) });
        });

        archive.finalize();
    });
}