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
exports.uploadPullRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uploadPullRequest = (preUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = path_1.default.join(process.cwd(), "../", "pr.gz");
    try {
        const url = preUrl.url;
        const { bucket, 'X-Amz-Algorithm': xAmzAlgorithm, 'X-Amz-Credential': xAmzCredential, 'X-Amz-Date': xAmzDate, key, Policy, 'X-Amz-Signature': xAmzSignature } = preUrl.fields;
        // Prepare the form data
        const formData = new form_data_1.default();
        formData.append('bucket', bucket);
        formData.append('X-Amz-Algorithm', xAmzAlgorithm);
        formData.append('X-Amz-Credential', xAmzCredential);
        formData.append('X-Amz-Date', xAmzDate);
        formData.append('key', key);
        formData.append('Policy', Policy);
        formData.append('X-Amz-Signature', xAmzSignature);
        formData.append('file', fs_1.default.createReadStream(filePath)); // Attach the file
        // Make the POST request to upload the file
        const result = yield axios_1.default.post(url, formData, {
            headers: Object.assign(Object.assign({}, formData.getHeaders()), { 'Content-Type': 'application/gzip' }),
        });
        console.log("File uploaded successfully:", result.data);
        yield fs_extra_1.default.remove(filePath);
    }
    catch (error) {
        yield fs_extra_1.default.remove(filePath);
        //@ts-ignore
        // console.log(clc.redBright("Error uploading file:", error.message));
        //@ts-ignore
        console.log(((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message); // Additional error info
    }
});
exports.uploadPullRequest = uploadPullRequest;
