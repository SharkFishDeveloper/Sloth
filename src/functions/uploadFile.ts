import axios from "axios";
import clc from "cli-color";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import fsExtra from "fs-extra";

export const uploadFile = async (preUrl: any, userId: string) => {

  const filePath = path.join(process.cwd(),"../","pr.gzip");
  try {
    const url = preUrl.url;
    const {
      bucket,
      'X-Amz-Algorithm': xAmzAlgorithm,
      'X-Amz-Credential': xAmzCredential,
      'X-Amz-Date': xAmzDate,
      key,
      Policy,
      'X-Amz-Signature': xAmzSignature
    } = preUrl.fields;

    // Prepare the form data
    const formData = new FormData();
    formData.append('bucket', bucket);
    formData.append('X-Amz-Algorithm', xAmzAlgorithm);
    formData.append('X-Amz-Credential', xAmzCredential);
    formData.append('X-Amz-Date', xAmzDate);
    formData.append('key', key);
    formData.append('Policy', Policy);
    formData.append('X-Amz-Signature', xAmzSignature);
    formData.append('file', fs.createReadStream(filePath)); // Attach the file

    // Make the POST request to upload the file
    const result = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(), 
        'Content-Type': 'application/gzip'
      },
    });

    console.log("File uploaded successfully:", result.data);
    await fsExtra.remove(filePath);
  } catch (error) {
    await fsExtra.remove(filePath);
    //@ts-ignore
    console.log(clc.redBright("Error uploading file:", error.message));
    //@ts-ignore
    console.log(error.response?.data || error.message); // Additional error info
  }
};
