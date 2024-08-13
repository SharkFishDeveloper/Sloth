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
exports.initOriginMethod = void 0;
const axios_1 = __importDefault(require("axios"));
const sendFile_1 = require("./sendFile");
const cli_color_1 = __importDefault(require("cli-color"));
function initOriginMethod() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reponame = yield (0, sendFile_1.promptQuestion)('Enter Repo name: ');
            const email = yield (0, sendFile_1.promptQuestion)('Enter your username: ');
            const password = yield (0, sendFile_1.promptQuestion)('Enter your password: ');
            const result = yield axios_1.default.post(`http://localhost:3000/init`, { reponame, email, password });
            console.log(result.data);
        }
        catch (error) {
            //@ts-ignore
            console.log(cli_color_1.default.redBright(error.response.data.message));
        }
    });
}
exports.initOriginMethod = initOriginMethod;
