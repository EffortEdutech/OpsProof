export type ReportDataBinding =
  | "report"
  | "client"
  | "site"
  | "job"
  | "summary"
  | "assets"
  | "findings"
  | "checklistGroups";

export type ReportBlockType =
  | "header"
  | "summary_grid"
  | "asset_table"
  | "field_evidence"
  | "checklist_evidence"
  | "signature_box"
  | "static_text";

export type ReportPageDefinition = {
  size: "A4";
  orientation: "portrait" | "landscape";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export type ReportLayoutBinding = {
  source?: ReportDataBinding;
  fields?: string[];
};

export type ReportLayoutSection = {
  sectionId: string;
  blockType: ReportBlockType;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  binding: ReportLayoutBinding;
  options?: Record<string, boolean | number | string | string[]>;
};

export type ReportLayoutDefinition = {
  layoutId: string;
  name: string;
  version: string;
  locked: boolean;
  page: ReportPageDefinition;
  sections: ReportLayoutSection[];
};
