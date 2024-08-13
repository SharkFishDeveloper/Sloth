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
exports.zipFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
function zipFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // await fsExtra.remove(path.join(process.cwd(),"../","pr/Sloth"))
        fs_1.default.mkdirSync(path_1.default.join(process.cwd(), "../", "Sloth.zip"));
        const outputPath = path_1.default.join(process.cwd(), "../", "Sloth.zip");
        console.log(outputPath);
        // return;
        return new Promise((resolve, reject) => {
            const output = fs_1.default.createWriteStream(outputPath);
            const archive = (0, archiver_1.default)('zip', {
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
                const fileName = path_1.default.relative(path_1.default.dirname(files[0]), file); // Maintain folder structure
                archive.file(file, { name: fileName });
            });
            archive.finalize();
        });
    });
}
exports.zipFiles = zipFiles;
