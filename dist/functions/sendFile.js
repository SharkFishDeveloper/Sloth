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
exports.Push = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
const readline_1 = __importDefault(require("readline"));
function promptQuestion(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}
function Push(diff, branchname, parentBranch, history) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(diff, branchname, parentBranch, history);
        const messages = [];
        for (const id in history) {
            const entry = history[id];
            messages.push(entry.message);
        }
        const reponame = yield promptQuestion('Enter Repo name: ');
        const username = yield promptQuestion('Enter your username: ');
        const password = yield promptQuestion('Enter your password: ');
        //@ts-ignore
        if (reponame.length < 6 && username.length < 6 || password.length < 6) {
            return console.log(cli_color_1.default.redBright(`Reponame or Name or Password is too short !!`));
        }
        if (diff.length === 0) {
            return console.log(cli_color_1.default.redBright(`Nothing to commit`));
        }
    });
}
exports.Push = Push;
