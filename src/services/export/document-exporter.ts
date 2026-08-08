import {
  ExportAccessDeniedError,
  type ExportAccessPolicy,
  type ExportFeature,
} from './export-policy';

export type ExportOutcome = { mode: 'shared' | 'printed'; accessSource: 'free' };

export type DocumentExportPorts = {
  platform: 'android' | 'ios' | 'web' | 'macos' | 'windows';
  printToFile: (html: string) => Promise<{ uri: string }>;
  printHtml: (html: string) => Promise<void>;
  isSharingAvailable: () => Promise<boolean>;
  shareFile: (uri: string, title: string) => Promise<void>;
  deleteFile: (uri: string) => void;
};

export class DocumentExportError extends Error {
  constructor() {
    super('Document export and fallback printing failed');
    this.name = 'DocumentExportError';
  }
}

export class DocumentExporter {
  constructor(
    private readonly ports: DocumentExportPorts,
    private readonly policy: ExportAccessPolicy,
  ) {}

  async exportHtml(feature: ExportFeature, html: string, title: string): Promise<ExportOutcome> {
    const access = await this.policy.requestAccess(feature);
    if (!access.granted) throw new ExportAccessDeniedError();
    let uri: string | undefined;

    try {
      if (this.ports.platform === 'web') {
        await this.ports.printHtml(html);
        return { mode: 'printed', accessSource: access.source };
      }
      const file = await this.ports.printToFile(html);
      uri = file.uri;
      if (!(await this.ports.isSharingAvailable())) {
        await this.ports.printHtml(html);
        return { mode: 'printed', accessSource: access.source };
      }
      await this.ports.shareFile(uri, title);
      return { mode: 'shared', accessSource: access.source };
    } catch {
      try {
        await this.ports.printHtml(html);
        return { mode: 'printed', accessSource: access.source };
      } catch {
        throw new DocumentExportError();
      }
    } finally {
      if (uri) {
        try {
          this.ports.deleteFile(uri);
        } catch {
          // Cleanup failure must not replace the user's export outcome.
        }
      }
    }
  }
}
