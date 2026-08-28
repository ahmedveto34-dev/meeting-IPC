import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  TableLayoutType,
  PageBreak,
} from "docx";
import saveAs from "file-saver";
import {
  WHOObservationSession,
  WHOBasicComplianceSheetData,
  WHOIndicationComplianceSheetData,
  CenterSettings,
  WHO_FIVE_MOMENTS,
  WHO_PROF_CATEGORIES,
} from "../types";

// Standard borders
const solidBorder = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000",
};

const tableCellBorders = {
  top: solidBorder,
  bottom: solidBorder,
  left: solidBorder,
  right: solidBorder,
};

const crispSubtleBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "CBD5E1",
};

const subtleBorders = {
  top: crispSubtleBorder,
  bottom: crispSubtleBorder,
  left: crispSubtleBorder,
  right: crispSubtleBorder,
};

const standardMargins = {
  top: 120,
  bottom: 120,
  left: 140,
  right: 140,
};

const cairoFont = "Cairo";

/**
 * Exports complete WHO Hand Hygiene Multi-Page Statistics Report to Word (.docx)
 * Contains all 5 sections with clear PageBreaks:
 * Page 1: Executive Summary & Key KPIs with clear bold percentages
 * Page 2: WHO Basic Compliance Calculation Sheet (Page 3)
 * Page 3: WHO 5 Moments Indication Calculation Sheet (Page 4)
 * Page 4: All Recorded Observation Sessions Breakdown Table
 * Page 5: Recommendations, Action Plan & Official Signatures
 */
export async function exportHandHygieneStatisticsToWord({
  sessions,
  basicCalcData,
  indicationCalcData,
  centerSettings,
  periodTitle = "الفترة الإحصائية الحالية (2026)",
  targetCompliance = 85,
  customNotes = "",
}: {
  sessions: WHOObservationSession[];
  basicCalcData: WHOBasicComplianceSheetData;
  indicationCalcData: WHOIndicationComplianceSheetData;
  centerSettings: CenterSettings;
  periodTitle?: string;
  targetCompliance?: number;
  customNotes?: string;
}) {
  const facilityName = centerSettings.centerName || "Waheed IPC";
  const overallRate = basicCalcData.overallComplianceRate;
  const isTargetAchieved = overallRate >= targetCompliance;

  // =========================================================================
  // PAGE 1: EXECUTIVE SUMMARY & KEY KPIS
  // =========================================================================

  // 1. Official Header Table
  const page1HeaderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    rows: [
      new TableRow({
        children: [
          // Right: Health Authority & Center
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "وزارة الصحة والسكان - قطاع الرعاية الصحية",
                    bold: true,
                    font: cairoFont,
                    size: 20,
                    color: "1E293B",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `${facilityName} - ${centerSettings.departmentTitle || "قسم مكافحة العدوى"}`,
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: "047857",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          // Left: Document Meta
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `الفترة الإحصائية: ${periodTitle}`,
                    bold: true,
                    font: cairoFont,
                    size: 20,
                    color: "475569",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`,
                    font: cairoFont,
                    size: 18,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Title Banner
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { before: 200, after: 150 },
    children: [
      new TextRun({
        text: "التقرير الإحصائي الشامل لمعدلات امتثال نظافة وتطهير الأيدي (WHO)",
        bold: true,
        font: cairoFont,
        size: 28,
        color: "0F172A",
        rightToLeft: true,
      }),
    ],
  });

  const subtitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: 250 },
    children: [
      new TextRun({
        text: "مبني على أداة الرصد الميداني والدواعي الخمسة المعتمدة من منظمة الصحة العالمية (WHO 5 Moments for Hand Hygiene)",
        font: cairoFont,
        size: 18,
        color: "475569",
        rightToLeft: true,
      }),
    ],
  });

  // 2. Executive KPI Summary Table with Clear Percentage Box
  const kpiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          // Total Opps
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: "إجمالي الفرص المرصودة", font: cairoFont, size: 17, color: "64748B", rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${basicCalcData.grandTotal.oppCount} فرصة`, bold: true, font: cairoFont, size: 26, color: "0F172A", rightToLeft: true }),
                ],
              }),
            ],
          }),
          // Total Actions
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: "إجمالي الإجراءات (HW + HR)", font: cairoFont, size: 17, color: "64748B", rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${basicCalcData.grandTotal.actCount} إجراء`, bold: true, font: cairoFont, size: 26, color: "047857", rightToLeft: true }),
                ],
              }),
            ],
          }),
          // Overall Compliance
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isTargetAchieved ? "ECFDF5" : "FFFBEB" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: "المعدل العام للامتثال", font: cairoFont, size: 18, color: "065F46", bold: true, rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${overallRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 32,
                    color: isTargetAchieved ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          // Target & Status
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: `الهدف المعتمد: ≥ %${targetCompliance}`, font: cairoFont, size: 17, color: "64748B", bold: true, rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: isTargetAchieved ? "✓ محقق بنجاح" : "⚠ يحتاج لتحسين",
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: isTargetAchieved ? "047857" : "DC2626",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Page 1 Professional & Moment Summary Matrix
  const page1SummaryHeading = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: "ملخص معدلات الامتثال السريعة حسب الفئات المهنية ودواعي الغسيل:",
        bold: true,
        font: cairoFont,
        size: 20,
        color: "1E293B",
        rightToLeft: true,
      }),
    ],
  });

  const page1SummaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "047857" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: "تمريض وقبالة (Nurse)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "047857" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: "مساعدو الخدمات (Auxiliary)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "047857" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: "الأطباء البشريين (Doctor)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "047857" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: "الفئات الأخرى (Other HCW)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "065F46" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: "المعدل العام الكلي", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${basicCalcData.totalNurse.complianceRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: basicCalcData.totalNurse.complianceRate >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${basicCalcData.totalNurse.actCount}/${basicCalcData.totalNurse.oppCount})`,
                    font: cairoFont,
                    size: 15,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${basicCalcData.totalAuxiliary.complianceRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: basicCalcData.totalAuxiliary.complianceRate >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${basicCalcData.totalAuxiliary.actCount}/${basicCalcData.totalAuxiliary.oppCount})`,
                    font: cairoFont,
                    size: 15,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${basicCalcData.totalDoctor.complianceRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: basicCalcData.totalDoctor.complianceRate >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${basicCalcData.totalDoctor.actCount}/${basicCalcData.totalDoctor.oppCount})`,
                    font: cairoFont,
                    size: 15,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${basicCalcData.totalOther.complianceRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 22,
                    color: basicCalcData.totalOther.complianceRate >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${basicCalcData.totalOther.actCount}/${basicCalcData.totalOther.oppCount})`,
                    font: cairoFont,
                    size: 15,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: "ECFDF5" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${overallRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 24,
                    color: "047857",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${basicCalcData.grandTotal.actCount}/${basicCalcData.grandTotal.oppCount})`,
                    bold: true,
                    font: cairoFont,
                    size: 16,
                    color: "047857",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // End of Page 1 -> Page Break
  const page1Break = new Paragraph({
    children: [new PageBreak()],
  });

  // =========================================================================
  // PAGE 2: WHO BASIC COMPLIANCE CALCULATION SHEET (FORM PAGE 3)
  // =========================================================================

  const sec1Heading = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: "الصفحة 2: جدول حساب الامتثال الأساسي حسب الفئات المهنية (WHO Calculation Sheet - Page 3)",
        bold: true,
        font: cairoFont,
        size: 22,
        color: "047857",
        rightToLeft: true,
      }),
    ],
  });

  const sec1Formula = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { after: 150 },
    children: [
      new TextRun({
        text: "معادلة الحساب المعتمدة: معدل الامتثال (%) = (عدد الإجراءات المطبقة [HW + HR] ÷ إجمالي الفرص المرصودة [Opportunities]) × 100",
        font: cairoFont,
        size: 17,
        color: "475569",
        bold: true,
        rightToLeft: true,
      }),
    ],
  });

  // Basic Compliance Table Rows
  const basicTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "رقم الجلسة", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "القسم / الجناح والتاريخ", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "1. التمريض (Act / Opp)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "2. المساعدون (Act / Opp)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "3. الأطباء (Act / Opp)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "065F46" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "المجموع الكلي للجلسة", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
      ],
    }),
  ];

  // Populate session rows
  basicCalcData.sessions.forEach((sessRow, idx) => {
    const isEven = idx % 2 === 0;
    basicTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `جلسة ${sessRow.sessionNumber}`, bold: true, font: cairoFont, size: 17, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [new TextRun({ text: sessRow.sessionTitle || sessRow.department || "قسم رصد", font: cairoFont, size: 16, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: sessRow.nurse.oppCount > 0 ? `${sessRow.nurse.actCount} / ${sessRow.nurse.oppCount}\n(%${sessRow.nurse.complianceRate})` : "—",
                    font: cairoFont,
                    size: 16,
                    bold: sessRow.nurse.oppCount > 0,
                    color: sessRow.nurse.oppCount > 0 ? "0F172A" : "94A3B8",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: sessRow.auxiliary.oppCount > 0 ? `${sessRow.auxiliary.actCount} / ${sessRow.auxiliary.oppCount}\n(%${sessRow.auxiliary.complianceRate})` : "—",
                    font: cairoFont,
                    size: 16,
                    bold: sessRow.auxiliary.oppCount > 0,
                    color: sessRow.auxiliary.oppCount > 0 ? "0F172A" : "94A3B8",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: sessRow.doctor.oppCount > 0 ? `${sessRow.doctor.actCount} / ${sessRow.doctor.oppCount}\n(%${sessRow.doctor.complianceRate})` : "—",
                    font: cairoFont,
                    size: 16,
                    bold: sessRow.doctor.oppCount > 0,
                    color: sessRow.doctor.oppCount > 0 ? "0F172A" : "94A3B8",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `${sessRow.total.actCount} / ${sessRow.total.oppCount}\n(%${sessRow.total.complianceRate})`,
                    bold: true,
                    font: cairoFont,
                    size: 17,
                    color: "047857",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  // Grand Total Summary Row
  basicTableRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "E2E8F0" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "المجموع الإجمالي ومعدل الامتثال الكلي", bold: true, font: cairoFont, size: 18, color: "0F172A", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "E2E8F0" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${basicCalcData.totalNurse.actCount}/${basicCalcData.totalNurse.oppCount}\n(%${basicCalcData.totalNurse.complianceRate})`,
                  bold: true,
                  font: cairoFont,
                  size: 18,
                  color: "047857",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "E2E8F0" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${basicCalcData.totalAuxiliary.actCount}/${basicCalcData.totalAuxiliary.oppCount}\n(%${basicCalcData.totalAuxiliary.complianceRate})`,
                  bold: true,
                  font: cairoFont,
                  size: 18,
                  color: "047857",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "E2E8F0" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${basicCalcData.totalDoctor.actCount}/${basicCalcData.totalDoctor.oppCount}\n(%${basicCalcData.totalDoctor.complianceRate})`,
                  bold: true,
                  font: cairoFont,
                  size: 18,
                  color: "047857",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "DCFCE7" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${basicCalcData.grandTotal.actCount}/${basicCalcData.grandTotal.oppCount}\n(%${overallRate})`,
                  bold: true,
                  font: cairoFont,
                  size: 20,
                  color: "047857",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const basicComplianceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: basicTableRows,
  });

  // End of Page 2 -> Page Break
  const page2Break = new Paragraph({
    children: [new PageBreak()],
  });

  // =========================================================================
  // PAGE 3: WHO 5 MOMENTS INDICATION CALCULATION SHEET (FORM PAGE 4)
  // =========================================================================

  const sec2Heading = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: "الصفحة 3: معدلات الامتثال حسب دواعي غسيل الأيدي الخمسة (WHO 5 Moments - Page 4)",
        bold: true,
        font: cairoFont,
        size: 22,
        color: "D97706",
        rightToLeft: true,
      }),
    ],
  });

  const sec2Formula = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { after: 150 },
    children: [
      new TextRun({
        text: "معادلة الحساب المعتمدة: نسبة الداعي (%) = (عدد الإجراءات المطبقة المرتبطة بالداعي ÷ إجمالي تكرار الداعي [Indications]) × 100",
        font: cairoFont,
        size: 17,
        color: "475569",
        bold: true,
        rightToLeft: true,
      }),
    ],
  });

  const momentsTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "D97706" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "رقم الداعي", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 42, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "D97706" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: "داعي غسيل الأيدي المعتمد (WHO 5 Moments)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "D97706" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "عدد الدواعي (Indic)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "D97706" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "عدد الإجراءات (HW+HR)", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "B45309" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "نسبة الامتثال %", bold: true, font: cairoFont, size: 17, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
      ],
    }),
  ];

  const momentsDataList = [
    { num: 1, title: "1. قبل ملامسة المريض (Before touching patient)", data: indicationCalcData.totalBefPat },
    { num: 2, title: "2. قبل الإجراء النظيف / المعقم (Before clean/aseptic procedure)", data: indicationCalcData.totalBefAsept },
    { num: 3, title: "3. بعد خطر التعرض لسوائل الجسم (After body fluid exposure risk)", data: indicationCalcData.totalAftBf },
    { num: 4, title: "4. بعد ملامسة المريض (After touching patient)", data: indicationCalcData.totalAftPat },
    { num: 5, title: "5. بعد ملامسة محيط وبيئة المريض (After touching surroundings)", data: indicationCalcData.totalAftSurr },
  ];

  momentsDataList.forEach((m, idx) => {
    const isEven = idx % 2 === 0;
    momentsTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "FFFBEB" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `${m.num}`, bold: true, font: cairoFont, size: 17, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "FFFBEB" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [new TextRun({ text: m.title, bold: true, font: cairoFont, size: 16, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "FFFBEB" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `${m.data.indicCount}`, font: cairoFont, size: 17, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "FFFBEB" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `${m.data.actCount}`, font: cairoFont, size: 17, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "FFFBEB" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${m.data.ratio}`,
                    bold: true,
                    font: cairoFont,
                    size: 19,
                    color: m.data.ratio >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  const momentsComplianceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: momentsTableRows,
  });

  // End of Page 3 -> Page Break
  const page3Break = new Paragraph({
    children: [new PageBreak()],
  });

  // =========================================================================
  // PAGE 4: DETAILED OBSERVATION SESSIONS BREAKDOWN
  // =========================================================================

  const sec4Heading = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: `الصفحة 4: سجل واستمارات جلسات الرصد الميداني التفصيلية (${sessions.length} جلسة رصد)`,
        bold: true,
        font: cairoFont,
        size: 22,
        color: "0F172A",
        rightToLeft: true,
      }),
    ],
  });

  const sessionsTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "1E293B" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "رقم", bold: true, font: cairoFont, size: 16, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "1E293B" },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: "القسم / الجناح / التاريخ", bold: true, font: cairoFont, size: 16, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "1E293B" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "الراصد والمدة", bold: true, font: cairoFont, size: 16, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 36, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "1E293B" },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: "تفاصيل الفئات والفرص المرصودة", bold: true, font: cairoFont, size: 16, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "نسبة امتثال الجلسة %", bold: true, font: cairoFont, size: 16, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
      ],
    }),
  ];

  sessions.forEach((sess, sIdx) => {
    const isEven = sIdx % 2 === 0;
    const matchedBasic = basicCalcData.sessions.find((b) => b.sessionNumber === sess.sessionNumber);
    const sessionRate = matchedBasic ? matchedBasic.total.complianceRate : 0;
    const sessionOpp = matchedBasic ? matchedBasic.total.oppCount : 0;
    const sessionAct = matchedBasic ? matchedBasic.total.actCount : 0;

    const columnsSummary = (sess.columns || [])
      .map((c) => {
        const oppCount = (c.opportunities || []).filter((o) => (o.indications && o.indications.length > 0) || !!o.action).length;
        const hrCount = (c.opportunities || []).filter((o) => o.action === "HR").length;
        const hwCount = (c.opportunities || []).filter((o) => o.action === "HW").length;
        return `• ${c.profCatName} (${c.profCatCode}): ${oppCount} فرص [كحول:${hrCount}, ماء:${hwCount}]`;
      })
      .join("\n");

    sessionsTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `${sess.sessionNumber}`, bold: true, font: cairoFont, size: 16, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${sess.ward || sess.department || "قسم رصد"}`, bold: true, font: cairoFont, size: 16, rightToLeft: true }),
                  new TextRun({ text: `\nتاريخ: ${sess.date}`, font: cairoFont, size: 14, color: "64748B", rightToLeft: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${sess.observer || "مكافحة العدوى"}`, font: cairoFont, size: 15, rightToLeft: true }),
                  new TextRun({ text: `\n(${sess.sessionDuration || 20} دقيقة)`, font: cairoFont, size: 14, color: "64748B", rightToLeft: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [new TextRun({ text: columnsSummary || "لا توجد أعمدة مسجلة", font: cairoFont, size: 14, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            shading: { fill: isEven ? "FFFFFF" : "F8FAFC" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `%${sessionRate}`,
                    bold: true,
                    font: cairoFont,
                    size: 18,
                    color: sessionRate >= targetCompliance ? "047857" : "D97706",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `\n(${sessionAct}/${sessionOpp})`,
                    font: cairoFont,
                    size: 14,
                    color: "64748B",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  const observationSessionsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: sessionsTableRows,
  });

  // End of Page 4 -> Page Break
  const page4Break = new Paragraph({
    children: [new PageBreak()],
  });

  // =========================================================================
  // PAGE 5: RECOMMENDATIONS, ACTION PLAN & OFFICIAL SIGNATURES
  // =========================================================================

  const sec5Heading = new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: "الصفحة 5: التحليل والتوصيات وخطة التحسين واعتمادات التوقيع الرسمية",
        bold: true,
        font: cairoFont,
        size: 22,
        color: "0F172A",
        rightToLeft: true,
      }),
    ],
  });

  const notesText =
    customNotes ||
    "1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.\n2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.\n3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.\n4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.";

  const notesParagraphs = notesText.split("\n").map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: line,
            font: cairoFont,
            size: 18,
            color: "334155",
            rightToLeft: true,
          }),
        ],
      })
  );

  // Signatures Table
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "مسؤول / راصد مكافحة العدوى",
                    bold: true,
                    font: cairoFont,
                    size: 20,
                    color: "1E293B",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 80 },
                children: [
                  new TextRun({
                    text: centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان",
                    font: cairoFont,
                    size: 19,
                    color: "475569",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: "التوقيع: .......................................",
                    font: cairoFont,
                    size: 18,
                    color: "94A3B8",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "مدير المركز / المستشفى",
                    bold: true,
                    font: cairoFont,
                    size: 20,
                    color: "1E293B",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 80 },
                children: [
                  new TextRun({
                    text: centerSettings.medicalDirector || "د/ إيناس",
                    font: cairoFont,
                    size: 19,
                    color: "475569",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: "التوقيع والاعتماد: ............................",
                    font: cairoFont,
                    size: 18,
                    color: "94A3B8",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Assemble Complete Multi-Page Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: cairoFont,
            size: 22,
            rightToLeft: true,
            color: "000000",
          },
          paragraph: {
            alignment: AlignmentType.RIGHT,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Page 1: Executive Summary & KPIs
          page1HeaderTable,
          titleParagraph,
          subtitleParagraph,
          kpiTable,
          page1SummaryHeading,
          page1SummaryTable,
          page1Break,

          // Page 2: Basic Compliance Sheet (Page 3)
          sec1Heading,
          sec1Formula,
          basicComplianceTable,
          page2Break,

          // Page 3: Indication 5 Moments Sheet (Page 4)
          sec2Heading,
          sec2Formula,
          momentsComplianceTable,
          page3Break,

          // Page 4: All Observation Sessions Breakdown
          sec4Heading,
          observationSessionsTable,
          page4Break,

          // Page 5: Recommendations & Signatures
          sec5Heading,
          ...notesParagraphs,
          new Paragraph({ spacing: { before: 300 } }),
          signaturesTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFacility = facilityName.replace(/\s+/g, "_");
  const fileName = `التقرير_الشامل_لإحصائية_غسيل_الأيدي_WHO_${safeFacility}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}

/**
 * Export single observation session form to Word
 */
export async function exportSingleHandHygieneSessionToWord(
  session: WHOObservationSession,
  centerSettings: CenterSettings
) {
  const facilityName = session.facility || centerSettings.centerName || "Waheed IPC";

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${facilityName} - قسم مكافحة العدوى`, bold: true, font: cairoFont, size: 22, color: "047857", rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `القسم: ${session.department || "عام"} | الجناح: ${session.ward || "الرئيسي"}`, font: cairoFont, size: 19, rightToLeft: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `استمارة رصد جلسة رقم: (${session.sessionNumber})`, bold: true, font: cairoFont, size: 22, color: "1E293B", rightToLeft: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `التاريخ: ${session.date} | الراصد: ${session.observer || "مكافحة العدوى"}`, font: cairoFont, size: 19, rightToLeft: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const titlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: "نموذج استمارة الرصد الميداني لنظافة الأيدي - منظمة الصحة العالمية (WHO Observation Form)",
        bold: true,
        font: cairoFont,
        size: 26,
        color: "0F172A",
        rightToLeft: true,
      }),
    ],
  });

  // Table of columns in the session
  const colTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "رقم العمود / الفئة المهنية", bold: true, font: cairoFont, size: 18, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "عدد العاملين", bold: true, font: cairoFont, size: 18, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
        new TableCell({
          borders: tableCellBorders,
          margins: standardMargins,
          shading: { fill: "047857" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text: "الفرص المرصودة والدواعي المنفذة", bold: true, font: cairoFont, size: 18, color: "FFFFFF", rightToLeft: true })],
            }),
          ],
        }),
      ],
    }),
  ];

  session.columns.forEach((col) => {
    const oppSummary = col.opportunities
      .filter((o) => o.indications.length > 0 || !!o.action)
      .map(
        (o) =>
          `فرصة ${o.oppNumber}: [دواعي: ${o.indications.join(", ") || "—"}] ← إجراء: ${o.action === "HR" ? "تطهير كحولي (HR)" : o.action === "HW" ? "غسيل بالماء (HW)" : "عدم امتثال (Missed)"}${o.gloves ? " [قفازات]" : ""}`
      )
      .join("\n");

    colTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: `عمود ${col.columnNumber}: ${col.profCatName} (${col.profCatCode})`, bold: true, font: cairoFont, size: 18, rightToLeft: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [new TextRun({ text: `${col.workersCount || 1}`, font: cairoFont, size: 18, rightToLeft: true })],
              }),
            ],
          }),
          new TableCell({
            borders: tableCellBorders,
            margins: standardMargins,
            children: oppSummary
              ? oppSummary.split("\n").map(
                  (line) =>
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      spacing: { after: 50 },
                      children: [new TextRun({ text: line, font: cairoFont, size: 16, rightToLeft: true })],
                    })
                )
              : [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    bidirectional: true,
                    children: [new TextRun({ text: "لا توجد فرص مسجلة", font: cairoFont, size: 16, color: "94A3B8", rightToLeft: true })],
                  }),
                ],
          }),
        ],
      })
    );
  });

  const sessionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: colTableRows,
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: cairoFont, size: 22, rightToLeft: true, color: "000000" },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [headerTable, titlePara, sessionTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `جلسة_رصد_غسيل_الأيدي_رقم_${session.sessionNumber}_${session.date.replace(/\//g, "-")}.docx`;
  saveAs(blob, fileName);
}
