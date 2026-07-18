import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { DocumentExporter, type DocumentExportPorts } from './document-exporter';
import { PhaseSixExportAccessPolicy } from './export-policy';

const expoPorts: DocumentExportPorts = {
  platform: Platform.OS,
  printToFile: async (html) => Print.printToFileAsync({ html }),
  printHtml: async (html) => Print.printAsync({ html }),
  isSharingAvailable: Sharing.isAvailableAsync,
  shareFile: async (uri, title) =>
    Sharing.shareAsync(uri, {
      dialogTitle: title,
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    }),
  deleteFile: (uri) => {
    const file = new File(uri);
    if (file.exists) file.delete();
  },
};

export const documentExporter = new DocumentExporter(expoPorts, new PhaseSixExportAccessPolicy());
