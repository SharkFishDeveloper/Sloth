import axios from "axios";
import path from "path";
import fs from "fs"

export async function downloadPr(preUrl:any) {
   try {
    const fullUrl= preUrl.url;
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
    const response = await axios.get(fullUrl, { responseType: 'stream' });
    const downloadfilePath = path.join(process.cwd(),"../");

     // Create a write stream to save the file
     const writer = fs.createWriteStream(downloadfilePath);
 
     // Pipe the response data to the file
     response.data.pipe(writer);
 
     writer.on('finish', () => {
       console.log('File downloaded successfully');
     });
 
     writer.on('error', (err) => {
       console.error('Error writing file:', err);
     });
   } catch (error) {
        console.log(error)
   }
}
