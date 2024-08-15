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
exports.mergePullRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const sendFile_1 = require("../sendFile");
const clc = require("cli-color");
function mergePullRequest() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const reponame = await promptQuestion('Enter your repo name: ')
            const prid = yield (0, sendFile_1.promptQuestion)('Enter pull request id: ');
            const email = yield (0, sendFile_1.promptQuestion)('Enter your email: ');
            const password = yield (0, sendFile_1.promptQuestion)('Enter your password: ');
            const result = yield axios_1.default.post("http://localhost:3000/merge", { prid, email, password });
            if (result.data.status) {
                return console.log(clc.redBright(result.data.message));
            }
            console.log(result.data.message);
        }
        catch (error) {
            console.log(error);
            if (axios_1.default.isAxiosError(error)) {
                console.log(clc.redBright(`Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}`));
                console.log(clc.redBright(`Data: ${JSON.stringify((_b = error.response) === null || _b === void 0 ? void 0 : _b.data)}`));
                console.log(clc.redBright(`Headers: ${JSON.stringify((_c = error.response) === null || _c === void 0 ? void 0 : _c.headers)}`));
            }
            else if (error instanceof Error) {
                console.log(clc.redBright("Error:"));
                console.log(clc.redBright(error.message));
            }
            else {
                console.log(clc.redBright("Unexpected error:", error));
            }
        }
    });
}
exports.mergePullRequest = mergePullRequest;