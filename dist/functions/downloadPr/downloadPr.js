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
function downloadPr(preUrl) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const downloadfilePath = path_1.default.join(process.cwd(), "../", "merge");
        yield fs_extra_1.default.mkdirp(downloadfilePath);
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
            console.log(`File successfully downloaded to: ${downloadfilePath}`);
        }
        catch (error) {
            //@ts-ignore
            console.log(error);
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
exports.downloadPr = downloadPr;
