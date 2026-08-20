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
  const arabicFont = "Traditional Arabic";
  const headerFont = "Arial";

  // 1. Attendees Table Rows
  const attendeeRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "الاسم",
                  bold: true,
                  font: headerFont,
                  size: 26, // 13pt
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "الوظيفة",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "التوقيع",
                  bold: true,
                  font: headerFont,
                  size: 26,
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
          children: [
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: m.name,
                      bold: true,
                      font: arabicFont,
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: m.role,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text:
                        m.signatureNote && m.signatureNote !== "تم التوقيع"
                          ? m.signatureNote
                          : (!m.attended ? "اعتذر" : ""),
                      font: arabicFont,
                      size: 24,
                      bold: m.attended,
                      color: m.attended ? "000000" : "666666",
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
    rows: attendeeRows,
  });

  // 2. Agenda bullet points
  const agendaParagraphs = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 280, after: 140 },
      children: [
        new TextRun({
          text: "جدول الأعمال",
          bold: true,
          underline: {},
          font: headerFont,
          size: 28,
        }),
      ],
    }),
    ...meeting.agenda.map(
      (item) =>
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `•  ${item}`,
              font: arabicFont,
              size: 26,
              bold: true,
            }),
          ],
        })
    ),
  ];

  // 3. Previous Meeting Follow-up (if present)
  const previousMeetingParagraphs = meeting.previousMeetingFollowUp
    ? [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: `* متابعة ما تم إنجازه بالاجتماع السابق${
                meeting.previousMeetingDate ? ` بتاريخ ${meeting.previousMeetingDate}` : ""
              } :`,
              bold: true,
              font: headerFont,
              size: 26,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: `•  ${meeting.previousMeetingFollowUp}`,
              font: arabicFont,
              size: 24,
            }),
          ],
        }),
      ]
    : [];

  // 4. Performance Indicators (KPIs)
  const kpiParagraphs = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: "مؤشرات الأداء",
          bold: true,
          underline: {},
          font: headerFont,
          size: 28,
        }),
      ],
    }),
    ...meeting.kpis.map(
      (kpi) =>
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `•  ${kpi.name} : `,
              bold: true,
              font: arabicFont,
              size: 26,
            }),
            new TextRun({
              text: `${kpi.value}${kpi.target ? ` [المستهدف: ${kpi.target}]` : ""}`,
              font: arabicFont,
              size: 26,
              bold: true,
            }),
          ],
        })
    ),
  ];

  // 5. Decisions & Recommendations Table (القرارات والتوصيات)
  const decisionRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "الموضوع",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 36, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "القرار / التوصية",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "المسؤول عن التنفيذ",
                  bold: true,
                  font: headerFont,
                  size: 24,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 11, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "المدة الزمنية",
                  bold: true,
                  font: headerFont,
                  size: 24,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 13, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "وسيلة المتابعة",
                  bold: true,
                  font: headerFont,
                  size: 24,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    ...meeting.decisions.map(
      (d) =>
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: d.topic,
                      bold: true,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: d.decision,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: d.responsible,
                      font: arabicFont,
                      size: 24,
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: d.duration,
                      bold: true,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: d.monitoringMethod,
                      font: arabicFont,
                      size: 24,
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
    rows: decisionRows,
  });

  // Assemble full Document
  const doc = new Document({
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
          // Header: Center Name
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: meeting.centerName || "مركز د احمد مصطفى للعيون",
                bold: true,
                font: headerFont,
                size: 28,
              }),
            ],
          }),

          // Committee Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: meeting.departmentTitle || "لجنة مكافحة العدوى",
                bold: true,
                font: headerFont,
                size: 28,
              }),
            ],
          }),

          // Meeting Number
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `الاجتماع رقم (${meeting.meetingNumber})`,
                bold: true,
                font: headerFont,
                size: 26,
              }),
            ],
          }),

          // Meeting Opening Statement
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `انه فى يوم : ${meeting.day} الموافق : ${meeting.date} م تم انعقاد اجتماع لجنة مكافحة العدوى بحضور السادة الاعضاء الاتى ذكرهم :`,
                bold: true,
                font: arabicFont,
                size: 24,
              }),
            ],
          }),

          // Attendees Table
          attendeesTable,

          // Agenda
          ...agendaParagraphs,

          // Previous Follow-up
          ...previousMeetingParagraphs,

          // KPIs
          ...kpiParagraphs,

          // Decisions Heading
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "القرارات والتوصيات",
                bold: true,
                underline: {},
                font: headerFont,
                size: 26,
              }),
            ],
          }),

          // Decisions Table
          decisionsTable,

          // Approvals Section
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 180 },
            children: [
              new TextRun({
                text: "الاعتماد",
                bold: true,
                underline: {},
                font: headerFont,
                size: 26,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "مسؤول مكافحة العدوى",
                            bold: true,
                            font: headerFont,
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                          new TextRun({
                            text: meeting.approvals?.infectionControlLead || "م/ أحمد وحيد شعبان",
                            font: arabicFont,
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "مشرف التمريض",
                            bold: true,
                            font: headerFont,
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                          new TextRun({
                            text: meeting.approvals?.preparedBy || "م/ عبد الله إبراهيم عمر",
                            font: arabicFont,
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "المدير الطبي",
                            bold: true,
                            font: headerFont,
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                          new TextRun({
                            text: meeting.approvals?.medicalDirector || "ا.د / احمد مصطفى",
                            font: arabicFont,
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
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
 */
export async function exportRoundToDocx(round: RoundReport) {
  const arabicFont = "Traditional Arabic";
  const headerFont = "Arial";

  // Metadata Table (اليوم / التاريخ / الفترة / القائم بالمرور)
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "الفترة : ", bold: true, font: headerFont, size: 26 }),
                  new TextRun({ text: round.period || "صباحي", font: arabicFont, size: 26, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "اليوم : ", bold: true, font: headerFont, size: 26 }),
                  new TextRun({ text: round.day || "الأحد", font: arabicFont, size: 26, bold: true }),
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
            borders: cellBorders,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "القائم بالمرور : ", bold: true, font: headerFont, size: 26 }),
                  new TextRun({ text: round.inspector || "م/ أحمد وحيد شعبان", font: arabicFont, size: 26, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "التاريخ : ", bold: true, font: headerFont, size: 26 }),
                  new TextRun({ text: round.date || "2026/06/28", font: arabicFont, size: 26, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Observations Table Rows
  const obsRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "الموقع",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "الملاحظات المرصودة",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "التوصيات والإجراء التصحيحي",
                  bold: true,
                  font: headerFont,
                  size: 26,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: lightGrayShading,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "المسؤول عن التنفيذ",
                  bold: true,
                  font: headerFont,
                  size: 24,
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
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: obs.location,
                      bold: true,
                      font: arabicFont,
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: obs.observation,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: obs.recommendation,
                      font: arabicFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: obs.responsible,
                      font: arabicFont,
                      size: 24,
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  ];

  // If fewer than 8 observations, pad empty rows to fill page like the official paper template
  const totalRowsNeeded = Math.max(obsRows.length, 7);
  while (obsRows.length < totalRowsNeeded) {
    obsRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: " ", size: 36 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: " ", size: 36 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: " ", size: 36 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: " ", size: 36 })] })],
          }),
        ],
      })
    );
  }

  const observationsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: obsRows,
  });

  const doc = new Document({
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
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: round.centerName,
                      bold: true,
                      font: headerFont,
                      size: 24,
                    }),
                  ],
                }),
              ]
            : []),

          // Title: تقرير المرور الاسبوعي
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: round.title || "تقرير المرور الاسبوعي",
                bold: true,
                font: headerFont,
                size: 32,
              }),
            ],
          }),

          // Metadata Table
          metaTable,

          new Paragraph({ spacing: { after: 120 } }),

          // Observations Table
          observationsTable,

          // Footer: مشرف مكافحة العدوى
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: round.supervisorRole || "مشرف مكافحة العدوى",
                bold: true,
                font: headerFont,
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 120 },
            children: [
              new TextRun({
                text: round.inspector ? `التوقيع: ${round.inspector}` : "........................",
                font: arabicFont,
                size: 22,
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
