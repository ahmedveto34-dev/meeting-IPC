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
  PageBorderOffsetFrom,
} from "docx";
import saveAs from "file-saver";
import { Meeting, RoundReport } from "../types";

// Standard border styling
const solidBorder = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000",
};

const cellBorders = {
  top: solidBorder,
  bottom: solidBorder,
  left: solidBorder,
  right: solidBorder,
};

const lightGrayShading = {
  fill: "F3F4F6",
};

/**
 * Generates and downloads a pristine Word (.docx) document for the Monthly Infection Control Committee Meeting
 */
export async function exportMeetingToDocx(meeting: Meeting) {
  const arabicFont = "Cairo";
  const headerFont = "Cairo";

  // Standard crisp cell borders
  const crispBorder = {
    style: BorderStyle.SINGLE,
    size: 6,
    color: "000000",
  };

  const tableCellBorders = {
    top: crispBorder,
    bottom: crispBorder,
    left: crispBorder,
    right: crispBorder,
  };

  const headerShading = {
    fill: "E2E8F0", // Slate-200 matching in-app table header
  };

  const standardCellMargins = {
    top: 100,
    bottom: 100,
    left: 140,
    right: 140,
  };

  // 1. Top Document Header (Center name on right, Time & Location on left with divider line)
  const headerLeftParagraphs: Paragraph[] = [];
  if (meeting.time) {
    headerLeftParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        bidirectional: true,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `الوقت: ${meeting.time}`,
            bold: true,
            font: headerFont,
            size: 22,
            color: "475569",
            rightToLeft: true,
          }),
        ],
      })
    );
  }
  if (meeting.location) {
    headerLeftParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        bidirectional: true,
        children: [
          new TextRun({
            text: `المكان: ${meeting.location}`,
            bold: true,
            font: headerFont,
            size: 22,
            color: "475569",
            rightToLeft: true,
          }),
        ],
      })
    );
  }
  if (headerLeftParagraphs.length === 0) {
    headerLeftParagraphs.push(new Paragraph({ bidirectional: true, children: [] }));
  }

  const topHeaderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          // Right Cell (Center Name & Department Title)
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 16, color: "0F172A" },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: { top: 60, bottom: 120, left: 60, right: 60 },
            verticalAlign: VerticalAlign.BOTTOM,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: meeting.centerName || "Waheed IPC",
                    bold: true,
                    font: headerFont,
                    size: 34,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: meeting.departmentTitle || "لجنة مكافحة العدوى",
                    bold: true,
                    font: headerFont,
                    size: 26,
                    color: "334155",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          // Left Cell (Time and Location)
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 16, color: "0F172A" },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: { top: 60, bottom: 120, left: 60, right: 60 },
            verticalAlign: VerticalAlign.BOTTOM,
            children: headerLeftParagraphs,
          }),
        ],
      }),
    ],
  });

  // 2. Meeting Title Banner (Centered Committee Title + Badge for Meeting Number)
  const meetingTitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: meeting.departmentTitle || "لجنة مكافحة العدوى",
        bold: true,
        font: headerFont,
        size: 32,
        color: "0F172A",
        rightToLeft: true,
      }),
    ],
  });

  const meetingBadgeTable = new Table({
    width: { size: 45, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "F1F5F9" }, // slate-100
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "64748B" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "64748B" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "64748B" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "64748B" },
            },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: `الاجتماع رقم (${meeting.meetingNumber})`,
                    bold: true,
                    font: headerFont,
                    size: 26,
                    color: "0F172A",
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

  // 3. Meeting Opening Statement Callout (Styled shaded box with right accent border)
  const openingCalloutTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "F8FAFC" }, // slate-50
            borders: {
              right: { style: BorderStyle.SINGLE, size: 24, color: "0F172A" }, // Thick right border
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                spacing: { line: 360 }, // generous line height
                children: [
                  new TextRun({
                    text: "إنه في يوم : ",
                    font: arabicFont,
                    size: 24,
                    color: "1E293B",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: meeting.day + " ",
                    bold: true,
                    font: headerFont,
                    size: 24,
                    color: "000000",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: "الموافق : ",
                    font: arabicFont,
                    size: 24,
                    color: "1E293B",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: meeting.date + "م",
                    bold: true,
                    font: headerFont,
                    size: 24,
                    color: "000000",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: "، تم انعقاد اجتماع لجنة مكافحة العدوى بحضور السادة الأعضاء الآتي ذكرهم :",
                    font: arabicFont,
                    size: 24,
                    color: "1E293B",
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

  // 4. Attendees Table Rows (جدول الحضور والتوقيعات)
  const attendeeRows = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "الاسم",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "الوظيفة",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "التوقيع",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    ...meeting.members.map(
      (m) =>
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: m.name,
                      bold: true,
                      font: arabicFont,
                      size: 24,
                      color: "0F172A",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: m.role,
                      font: arabicFont,
                      size: 22,
                      color: "334155",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text:
                        m.signatureNote && m.signatureNote !== "تم التوقيع"
                          ? m.signatureNote
                          : (!m.attended ? "اعتذر" : ""),
                      font: arabicFont,
                      size: 22,
                      bold: m.attended,
                      italics: !m.attended,
                      color: m.attended ? "0F172A" : "64748B",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  ];

  const attendeesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: attendeeRows,
  });

  // 5. Agenda Section (جدول الأعمال)
  const agendaParagraphs = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 260, after: 120 },
      children: [
        new TextRun({
          text: "جدول الأعمال",
          bold: true,
          underline: {},
          font: headerFont,
          size: 28,
          color: "0F172A",
          rightToLeft: true,
        }),
      ],
    }),
    ...meeting.agenda.map(
      (item) =>
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `•   ${item}`,
              font: arabicFont,
              size: 24,
              bold: true,
              color: "0F172A",
              rightToLeft: true,
            }),
          ],
        })
    ),
  ];

  // 6. Previous Meeting Follow-up (if present, in a stylish callout box)
  const previousMeetingBlock = meeting.previousMeetingFollowUp
    ? [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          visuallyRightToLeft: true,
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: "F8FAFC" },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                    left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                    right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                  },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      spacing: { after: 80 },
                      children: [
                        new TextRun({
                          text: `* متابعة ما تم إنجازه بالاجتماع السابق${
                            meeting.previousMeetingDate ? ` بتاريخ ${meeting.previousMeetingDate}` : ""
                          } :`,
                          bold: true,
                          font: headerFont,
                          size: 24,
                          color: "0F172A",
                          rightToLeft: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: `•  ${meeting.previousMeetingFollowUp}`,
                          font: arabicFont,
                          size: 24,
                          bold: true,
                          color: "1E293B",
                          rightToLeft: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ]
    : [];

  // 7. Performance Indicators (KPIs)
  const kpiParagraphs =
    meeting.kpis && meeting.kpis.length > 0
      ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "مؤشرات الأداء",
                bold: true,
                underline: {},
                font: headerFont,
                size: 28,
                color: "0F172A",
                rightToLeft: true,
              }),
            ],
          }),
          ...meeting.kpis.map(
            (kpi) =>
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: `•   ${kpi.name} : `,
                    bold: true,
                    font: arabicFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: `${kpi.value}`,
                    font: headerFont,
                    size: 24,
                    bold: true,
                    color: "000000",
                    rightToLeft: true,
                  }),
                  new TextRun({
                    text: kpi.target ? `   [المستهدف: ${kpi.target}]` : "",
                    font: arabicFont,
                    size: 22,
                    color: "475569",
                    rightToLeft: true,
                  }),
                ],
              })
          ),
        ]
      : [];

  // 8. Decisions & Recommendations Table (القرارات والتوصيات)
  const sortedDecisions = [...meeting.decisions].sort((a, b) => {
    if (a.isCarriedOver && !b.isCarriedOver) return -1;
    if (!a.isCarriedOver && b.isCarriedOver) return 1;
    return 0;
  });

  const decisionRows = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "الموضوع",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 36, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "التوصية / القرار",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "المسؤول عن التنفيذ",
                  bold: true,
                  font: headerFont,
                  size: 22,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 11, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "المدة الزمنية",
                  bold: true,
                  font: headerFont,
                  size: 22,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 13, type: WidthType.PERCENTAGE },
          borders: tableCellBorders,
          shading: headerShading,
          margins: standardCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "وسيلة المتابعة",
                  bold: true,
                  font: headerFont,
                  size: 22,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    ...sortedDecisions.map(
      (d) =>
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  children: [
                    ...(d.isCarriedOver
                      ? [
                          new TextRun({
                            text: `[📌 مرحل من السابق للمناقشة${d.sourceMeetingNumber ? ` (محضر ${d.sourceMeetingNumber})` : ""}] `,
                            bold: true,
                            font: arabicFont,
                            size: 20,
                            color: "92400E",
                            rightToLeft: true,
                          }),
                          new TextRun({
                            text: "\n",
                          }),
                        ]
                      : []),
                    new TextRun({
                      text: d.topic,
                      bold: true,
                      font: arabicFont,
                      size: 22,
                      color: "0F172A",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  spacing: { line: 280 },
                  children: [
                    new TextRun({
                      text: d.decision,
                      font: arabicFont,
                      size: 22,
                      color: "1E293B",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: d.responsible,
                      font: arabicFont,
                      size: 22,
                      bold: true,
                      color: "1E293B",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: d.duration,
                      bold: true,
                      font: arabicFont,
                      size: 22,
                      color: "0F172A",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: tableCellBorders,
              margins: standardCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: d.monitoringMethod,
                      font: arabicFont,
                      size: 22,
                      color: "334155",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  ];

  const decisionsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: decisionRows,
  });

  // 9. Approvals / Signatures Section (الاعتماد)
  const noBorder = { style: BorderStyle.NONE };
  const transparentBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };

  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          // Column 1 (Rightmost in RTL): مسئول مكافحة العدوى
          new TableCell({
            width: { size: 33.33, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "مسؤول مكافحة العدوى",
                    bold: true,
                    font: headerFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 180, after: 120 },
                children: [
                  new TextRun({
                    text: "........................................",
                    font: arabicFont,
                    size: 18,
                    color: "94A3B8",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: meeting.approvals?.infectionControlLead || "م/ أحمد وحيد شعبان",
                    bold: true,
                    font: arabicFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          // Column 2 (Middle in RTL): مشرف التمريض
          new TableCell({
            width: { size: 33.33, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "مشرف التمريض",
                    bold: true,
                    font: headerFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 180, after: 120 },
                children: [
                  new TextRun({
                    text: "........................................",
                    font: arabicFont,
                    size: 18,
                    color: "94A3B8",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: meeting.approvals?.preparedBy || "م/ عبد الله إبراهيم عمر",
                    bold: true,
                    font: arabicFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
          // Column 3 (Left in RTL): المدير الطبي
          new TableCell({
            width: { size: 33.33, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: "المدير الطبي",
                    bold: true,
                    font: headerFont,
                    size: 24,
                    color: "0F172A",
                    rightToLeft: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { before: 180, after: 120 },
                children: [
                  new TextRun({
                    text: "........................................",
                    font: arabicFont,
                    size: 18,
                    color: "94A3B8",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({
                    text: meeting.approvals?.medicalDirector || "ا.د / احمد مصطفى",
                    bold: true,
                    font: arabicFont,
                    size: 24,
                    color: "0F172A",
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

  // Assemble full Document with Cairo font and Right-to-Left defaults
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Cairo",
            size: 24,
            rightToLeft: true,
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
              top: 720, // 0.5 in
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // 1. Top Header Table (Center Name, Department, Time & Location)
          topHeaderTable,

          // 2. Title and Meeting Badge
          meetingTitleParagraph,
          meetingBadgeTable,

          new Paragraph({ bidirectional: true, spacing: { after: 120 } }),

          // 3. Opening Statement Box
          openingCalloutTable,

          new Paragraph({ bidirectional: true, spacing: { after: 140 } }),

          // 4. Attendees Table
          attendeesTable,

          // 5. Agenda List
          ...agendaParagraphs,

          // 6. Previous Meeting Follow-up (if present)
          ...(previousMeetingBlock.length > 0
            ? [new Paragraph({ bidirectional: true, spacing: { before: 160 } }), ...previousMeetingBlock]
            : []),

          // 7. KPIs List (if present)
          ...kpiParagraphs,

          // 8. Decisions & Recommendations Heading
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 260, after: 120 },
            children: [
              new TextRun({
                text: "القرارات والتوصيات",
                bold: true,
                underline: {},
                font: headerFont,
                size: 28,
                color: "0F172A",
                rightToLeft: true,
              }),
            ],
          }),

          // 9. Decisions Table
          decisionsTable,

          // 10. Approvals Heading & Signatures Grid
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { before: 340, after: 160 },
            children: [
              new TextRun({
                text: "الاعتماد",
                bold: true,
                underline: {},
                font: headerFont,
                size: 28,
                color: "0F172A",
                rightToLeft: true,
              }),
            ],
          }),

          signaturesTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFileName = `محضر_اجتماع_مكافحة_العدوى_رقم_${meeting.meetingNumber}_${meeting.date.replace(/[\/\\]/g, "-")}.docx`;
  saveAs(blob, cleanFileName);
}

/**
 * Generates and downloads a pristine Word (.docx) document for the Weekly Infection Control Rounds Report
 * matching the exact on-screen design, double border, Cairo font, table layout, and visual styling.
 */
export async function exportRoundToDocx(round: RoundReport) {
  const cairoFont = "Cairo";
  const headerFont = "Cairo";

  // Crisp black cell borders
  const crispBorder = {
    style: BorderStyle.SINGLE,
    size: 6,
    color: "000000",
  };

  const roundCellBorders = {
    top: crispBorder,
    bottom: crispBorder,
    left: crispBorder,
    right: crispBorder,
  };

  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 140,
    right: 140,
  };

  const tableHeaderShading = {
    fill: "E2E8F0", // Slate-200 matching in-app table header
  };

  const badgeShading = {
    fill: "F1F5F9", // Slate-100
  };

  // 1. Metadata Table (الفترة / اليوم / القائم بالمرور / التاريخ / القسم المستهدف إن وجد)
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({ text: "الفترة : ", bold: true, font: headerFont, size: 26, color: "000000", rightToLeft: true }),
                new TextRun({ text: round.period || "صباحي", font: cairoFont, size: 26, bold: true, color: "0F172A", rightToLeft: true }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({ text: "اليوم : ", bold: true, font: headerFont, size: 26, color: "000000", rightToLeft: true }),
                new TextRun({ text: round.day || "الأحد", font: cairoFont, size: 26, bold: true, color: "0F172A", rightToLeft: true }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({ text: "القائم بالمرور : ", bold: true, font: headerFont, size: 26, color: "000000", rightToLeft: true }),
                new TextRun({ text: round.inspector || "م/ أحمد وحيد شعبان", font: cairoFont, size: 26, bold: true, color: "0F172A", rightToLeft: true }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({ text: "التاريخ : ", bold: true, font: headerFont, size: 26, color: "000000", rightToLeft: true }),
                new TextRun({ text: round.date || "2026/06/28", font: cairoFont, size: 26, bold: true, color: "0F172A", rightToLeft: true }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  if (round.department) {
    metaRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: roundCellBorders,
            margins: cellMargins,
            columnSpan: 2,
            shading: badgeShading,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: "القسم المستهدف : ", bold: true, font: headerFont, size: 26, color: "000000", rightToLeft: true }),
                  new TextRun({ text: round.department, font: cairoFont, size: 26, bold: true, color: "1E3A8A", rightToLeft: true }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: metaRows,
  });

  // 2. Observations Table Rows
  const obsRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          shading: tableHeaderShading,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "الموقع / القسم",
                  bold: true,
                  font: headerFont,
                  size: 26,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          shading: tableHeaderShading,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "الملاحظات المرصودة",
                  bold: true,
                  font: headerFont,
                  size: 26,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          shading: tableHeaderShading,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "التوصيات والإجراء التصحيحي",
                  bold: true,
                  font: headerFont,
                  size: 26,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          borders: roundCellBorders,
          shading: tableHeaderShading,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: "المسؤول عن التنفيذ",
                  bold: true,
                  font: headerFont,
                  size: 24,
                  color: "000000",
                  rightToLeft: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    ...round.observations.map(
      (obs) =>
        new TableRow({
          children: [
            new TableCell({
              borders: roundCellBorders,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: obs.location || "-",
                      bold: true,
                      font: cairoFont,
                      size: 24,
                      color: "000000",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: roundCellBorders,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  spacing: { line: 260 },
                  children: [
                    new TextRun({
                      text: obs.observation,
                      font: cairoFont,
                      size: 24,
                      color: "0F172A",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: roundCellBorders,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  spacing: { line: 260 },
                  children: [
                    new TextRun({
                      text: obs.recommendation,
                      font: cairoFont,
                      size: 24,
                      color: "0F172A",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: roundCellBorders,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: obs.responsible || "مشرف مكافحة العدوى",
                      font: cairoFont,
                      size: 24,
                      bold: true,
                      color: "1E293B",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  ];

  // If fewer than 4 observations, pad empty rows to fill page like the official paper template
  const totalRowsNeeded = Math.max(obsRows.length, 5);
  while (obsRows.length < totalRowsNeeded) {
    obsRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: roundCellBorders,
            margins: cellMargins,
            children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: " ", size: 30 })] })],
          }),
          new TableCell({
            borders: roundCellBorders,
            margins: cellMargins,
            children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: " ", size: 30 })] })],
          }),
          new TableCell({
            borders: roundCellBorders,
            margins: cellMargins,
            children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: " ", size: 30 })] })],
          }),
          new TableCell({
            borders: roundCellBorders,
            margins: cellMargins,
            children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: " ", size: 30 })] })],
          }),
        ],
      })
    );
  }

  const observationsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
    alignment: AlignmentType.CENTER,
    rows: obsRows,
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Cairo",
            size: 24,
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
            borders: {
              pageBorderTop: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
              pageBorderBottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
              pageBorderLeft: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
              pageBorderRight: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
            },
          },
        },
        children: [
          // Center Name (if specified)
          ...(round.centerName
            ? [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: round.centerName,
                      bold: true,
                      font: headerFont,
                      size: 24,
                      rightToLeft: true,
                    }),
                  ],
                }),
              ]
            : []),

          // Title: تقرير المرور الاسبوعي (with underline matching UI)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { before: 140, after: 240 },
            children: [
              new TextRun({
                text: round.title || "تقرير المرور الاسبوعي",
                bold: true,
                underline: {},
                font: headerFont,
                size: 32,
                color: "000000",
                rightToLeft: true,
              }),
            ],
          }),

          // Metadata Table
          metaTable,

          new Paragraph({ bidirectional: true, spacing: { after: 140 } }),

          // Observations Table
          observationsTable,

          // Footer: مشرف مكافحة العدوى والتوقيع
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 360, after: 80 },
            children: [
              new TextRun({
                text: round.supervisorRole || "مشرف مكافحة العدوى",
                bold: true,
                font: headerFont,
                size: 26,
                color: "000000",
                rightToLeft: true,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 80 },
            children: [
              new TextRun({
                text: "التوقيع : ",
                font: headerFont,
                bold: true,
                size: 24,
                color: "000000",
                rightToLeft: true,
              }),
              new TextRun({
                text: round.inspector || "م/ أحمد وحيد شعبان",
                font: cairoFont,
                bold: true,
                underline: {},
                size: 26,
                color: "000000",
                rightToLeft: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFileName = `${round.title.replace(/\s+/g, "_")}_${round.date.replace(/[\/\\]/g, "-")}.docx`;
  saveAs(blob, cleanFileName);
}
