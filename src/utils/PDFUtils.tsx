import {encode} from 'base64-arraybuffer';
import {PDFDocument} from 'pdf-lib';
import RNFS from 'react-native-fs';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneArea: string;
  phoneNumber: string;
}

export const storePdfTemplateCache = async (pdfUrl: string) => {
  try {
    const cacheFilePath = RNFS.CachesDirectoryPath + '/pdf_blank.pdf';
    const response = await fetch(pdfUrl);
    const fileContentArrayBuffer = await response.arrayBuffer();
    const fileContentBase64 = encode(new Uint8Array(fileContentArrayBuffer));

    await RNFS.writeFile(cacheFilePath, fileContentBase64, 'base64');
    return cacheFilePath;
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export const fillPdf = async (
  sourcePath: string,
  fieldMappings: Record<string, string>,
): Promise<string | undefined> => {
  try {
    const templateBytes = await RNFS.readFile(sourcePath, 'base64');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    for (const [fieldName, value] of Object.entries(fieldMappings)) {
      const textField = form.getTextField(fieldName);
      if (textField) {
        textField.setText(value);
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfBase64 = encode(modifiedPdfBytes);

    const cachePath = RNFS.CachesDirectoryPath + '/pdf_filled.pdf';

    // Delete the previous file if it exists
    await RNFS.unlink(cachePath).catch(error => {
      // Ignore errors if the file doesn't exist
      if (error && error.code !== 'ENOENT') {
        console.error('Error deleting previous file:', error);
      }
    });

    // Save the new file
    await RNFS.writeFile(cachePath, modifiedPdfBase64, 'base64');

    return cachePath;
  } catch (error) {
    console.error('Error filling PDF:', error);
  }
};

export const downloadPDF = async (
  localPath: string,
  fileName: string,
): Promise<string | undefined> => {
  try {
    console.log(localPath);

    const downloadDir = RNFS.DownloadDirectoryPath;
    const destinationPath = `${downloadDir}/${fileName}`;

    // Copy the file to the download directory
    await RNFS.copyFile(localPath, destinationPath);

    return destinationPath;
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};
