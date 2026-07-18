export type ExportFeature = 'project_pdf' | 'comparison_pdf' | 'result_card';

export type ExportAccessDecision = {
  granted: boolean;
  source: 'free' | 'rewarded';
};

export interface ExportAccessPolicy {
  requestAccess(feature: ExportFeature): Promise<ExportAccessDecision>;
}

export class PhaseSixExportAccessPolicy implements ExportAccessPolicy {
  async requestAccess(): Promise<ExportAccessDecision> {
    return { granted: true, source: 'free' };
  }
}

export class ExportAccessDeniedError extends Error {
  constructor() {
    super('Export access was not granted');
    this.name = 'ExportAccessDeniedError';
  }
}
