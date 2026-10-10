import type { ReportLayoutDefinition } from "@/lib/reports/report-layout";

export const standardMaintenanceReportLayout = {
  layoutId: "standard-maintenance-report",
  name: "Standard Maintenance Report",
  version: "1.0.0",
  locked: true,
  page: {
    size: "A4",
    orientation: "portrait",
    margins: {
      top: 20,
      right: 16,
      bottom: 20,
      left: 16
    }
  },
  sections: [
    {
      sectionId: "report_header",
      blockType: "header",
      content: {
        title: "Maintenance Report",
        subtitle: "Fire safety service evidence"
      },
      binding: {
        source: "report",
        fields: ["reportNumber", "title", "status", "issuedAt"]
      }
    },
    {
      sectionId: "report_summary",
      blockType: "summary_grid",
      content: {
        title: "Report Summary"
      },
      binding: {
        source: "summary",
        fields: ["clientName", "siteName", "jobNumber", "scheduledDate", "generatedAt", "issuedAt"]
      },
      options: {
        columns: 3
      }
    },
    {
      sectionId: "asset_register",
      blockType: "asset_table",
      content: {
        title: "Serviced Assets"
      },
      binding: {
        source: "assets",
        fields: ["assetCode", "equipmentType", "systemName", "location", "inspectionStatus"]
      }
    },
    {
      sectionId: "field_evidence",
      blockType: "field_evidence",
      content: {
        title: "Field Evidence"
      },
      binding: {
        source: "findings",
        fields: ["title", "severity", "status", "description", "recommendation", "createdAt"]
      }
    },
    {
      sectionId: "checklist_results",
      blockType: "checklist_evidence",
      content: {
        title: "Checklist Results"
      },
      binding: {
        source: "checklistGroups",
        fields: ["assetCode", "checklistName", "status", "items"]
      }
    },
    {
      sectionId: "sign_off",
      blockType: "signature_box",
      content: {
        title: "Sign-off",
        description: "Prepared for client record and audit filing."
      },
      binding: {},
      options: {
        layout: "two_column"
      }
    }
  ]
} satisfies ReportLayoutDefinition;
