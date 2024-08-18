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
exports.pushOriginOwner = void 0;
const axios_1 = __importDefault(require("axios"));
const sendFile_1 = require("./sendFile");
const cli_color_1 = __importDefault(require("cli-color"));
const file_1 = require("./file");
const path_1 = __importDefault(require("path"));
const zipFiles_1 = require("./zipFiles");
const uploadFile_1 = require("./uploadFile");
function pushOriginOwner() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reponame = yield (0, sendFile_1.promptQuestion)('Enter Repo name: ');
            const email = yield (0, sendFile_1.promptQuestion)('Enter your username: ');
            const password = yield (0, sendFile_1.promptQuestion)('Enter your password: ');
            const result = yield axios_1.default.post(`http://localhost:3000/push`, { reponame, email, password });
            if (!result.data.id) {
                return console.log(cli_color_1.default.redBright(result.data.message));
            }
            const a = path_1.default.join(process.cwd());
            const files = (0, file_1.getAllFiles)(a);
            yield (0, zipFiles_1.zipFiles)(files);
            const preUrl = result.data.message;
            const userId = result.data.id;
            yield (0, uploadFile_1.uploadFile)(preUrl, userId);
        }
        catch (error) {
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
exports.pushOriginOwner = pushOriginOwner;
