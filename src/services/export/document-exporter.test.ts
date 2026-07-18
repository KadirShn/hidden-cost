import { describe, expect, it, jest } from '@jest/globals';

import {
  DocumentExporter,
  DocumentExportError,
  type DocumentExportPorts,
} from './document-exporter';

import type { ExportAccessPolicy } from './export-policy';

const policy: ExportAccessPolicy = {
  requestAccess: async () => ({ granted: true, source: 'free' }),
};

function ports(overrides: Partial<DocumentExportPorts> = {}): DocumentExportPorts {
  return {
    platform: 'android',
    printToFile: jest.fn(async () => ({ uri: 'file:///cache/report.pdf' })),
    printHtml: jest.fn(async () => undefined),
    isSharingAvailable: jest.fn(async () => true),
    shareFile: jest.fn(async () => undefined),
    deleteFile: jest.fn(() => undefined),
    ...overrides,
  };
}

describe('DocumentExporter', () => {
  it('shares the generated PDF and removes the temporary file', async () => {
    const adapter = ports();
    const result = await new DocumentExporter(adapter, policy).exportHtml(
      'project_pdf',
      '<html/>',
      'Report',
    );

    expect(result).toEqual({ mode: 'shared', accessSource: 'free' });
    expect(adapter.shareFile).toHaveBeenCalledWith('file:///cache/report.pdf', 'Report');
    expect(adapter.deleteFile).toHaveBeenCalledWith('file:///cache/report.pdf');
  });

  it('falls back to printing and still cleans up when sharing fails', async () => {
    const adapter = ports({ shareFile: jest.fn(async () => Promise.reject(new Error('share'))) });
    const result = await new DocumentExporter(adapter, policy).exportHtml(
      'result_card',
      '<html/>',
      'Card',
    );

    expect(result.mode).toBe('printed');
    expect(adapter.printHtml).toHaveBeenCalledWith('<html/>');
    expect(adapter.deleteFile).toHaveBeenCalledWith('file:///cache/report.pdf');
  });

  it('throws a stable error when generation and fallback both fail', async () => {
    const adapter = ports({
      printToFile: jest.fn(async () => Promise.reject(new Error('generate'))),
      printHtml: jest.fn(async () => Promise.reject(new Error('print'))),
    });

    await expect(
      new DocumentExporter(adapter, policy).exportHtml('comparison_pdf', '<html/>', 'Compare'),
    ).rejects.toBeInstanceOf(DocumentExportError);
    expect(adapter.deleteFile).not.toHaveBeenCalled();
  });
});
