import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import fsExtra from "fs-extra";

export async function zipFiles(files : string[]){
    // await fsExtra.remove(path.join(process.cwd(),"../","pr/Sloth"))
    fs.mkdirSync(path.join(process.cwd(),"../","Sloth"))
    const outputPath = path.join(process.cwd(),"../","Sloth");
    console.log(outputPath)
    // return;
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
            const fileName = path.relative(path.dirname(files[0]), file); // Maintain folder structure
            archive.file(file, { name: fileName });
        });

        archive.finalize();
    });
}