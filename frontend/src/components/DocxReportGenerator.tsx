import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  ShadingType,
} from "docx";
import { Work, Load, Sample, Company } from "../types";

export function generateConcreteTestReport(
  work: Work,
  company: Company,
  loads: Load[],
  samples: Sample[]
) {
  const reportNumber = `${new Date().getFullYear()}/${
    loads[0]?.numero_planilha?.toString().padStart(2, "0") || "01"
  }`;
  const firstLoad = loads[0];
  const lastSample = samples
    .filter((s) => s.data_prevista_rompimento)
    .sort(
      (a, b) =>
        new Date(b.data_prevista_rompimento!).getTime() -
        new Date(a.data_prevista_rompimento!).getTime()
    )[0];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  };

  const samplesByAge = samples.reduce((acc: any, sample: any) => {
    const age = sample.idade_dias;
    if (!acc[age]) acc[age] = [];
    acc[age].push(sample);
    return acc;
  }, {} as Record<number, any[]>);

  const sections = [];

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.SINGLE, size: 20, color: "000000" },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "MODEL",
                      bold: true,
                      size: 32,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "ENGENHARIA & TECNOLOGIA",
                      bold: true,
                      size: 32,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Model Engenharia e Tecnologia Ltda",
                      size: 16,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Via Morro Azul, 450", size: 16 }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "CEP: 95.780-000", size: 16 }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Três Cachoeiras (SC)", size: 16 }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ text: "" }),

    new Paragraph({
      children: [
        new TextRun({
          text: "FG 024 - RELATÓRIO DE ENSAIO",
          bold: true,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Relatório nº ${reportNumber}`,
          bold: true,
          color: "CC0000",
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "1. Dados do cliente", bold: true, size: 18 }),
      ],
      spacing: { before: 100, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Razão social: ", bold: true, size: 18 }),
        new TextRun({
          text: company.nome || "Não informado",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Endereço: ", bold: true, size: 18 }),
        new TextRun({
          text: company.endereco || work.endereco || "Não informado",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Orçamento/contrato: ", bold: true, size: 18 }),
        new TextRun({
          text: work.contrato || "Não informado",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "A/C – ", bold: true, size: 18 }),
        new TextRun({
          text: "Cliente",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "2. Responsáveis:", bold: true, size: 18 }),
      ],
      spacing: { before: 200, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Relatório de ensaio autorizado por: ",
          bold: true,
          size: 18,
        }),
        new TextRun({
          text: "Eng. Civil Felipe Model.",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Responsável técnico: ", bold: true, size: 18 }),
        new TextRun({
          text: "Eng. Civil Felipe Model.",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    })
  );

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "3. Amostras:", bold: true, size: 18 })],
      spacing: { before: 200, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Amostragem: ", bold: true, size: 18 }),
        new TextRun({
          text: "Informar se é realizada pelo cliente ou pela Model.",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Número(s) da(s) Amostra(s): ",
          bold: true,
          size: 18,
        }),
        new TextRun({
          text: samples.map((s: any) => s.numero_laboratorio).join(", "),
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Data de recebimento: ", bold: true, size: 18 }),
        new TextRun({
          text: formatDate(firstLoad?.data_moldagem),
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Período de Realização do Ensaio: ",
          bold: true,
          size: 18,
        }),
        new TextRun({
          text: `de ${formatDate(firstLoad?.data_moldagem)} até ${formatDate(
            lastSample?.data_prevista_rompimento
          )}`,
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Realização das atividades: ",
          bold: true,
          size: 18,
        }),
        new TextRun({
          text: "os ensaios foram realizados nas dependências permanentes do Laboratório Model Engenharia.",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Material ensaiado: ", bold: true, size: 18 }),
        new TextRun({
          text: "corpos-de-prova cilíndricos de concreto.",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "4. Objetivo: ", bold: true, size: 18 }),
        new TextRun({
          text: `ensaio de compressão de corpos de prova cilíndricos normais de concreto, identificados no Quadro ${work.codigo}.`,
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { before: 200, after: 120 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `As amostras analisadas são corpos de prova cilíndricos de concreto, com dimensões aproximadas de 100 mm de diâmetro por 200 mm de altura. A coleta do concreto e a moldagem dos corpos de prova foram realizadas pelo cliente na obra "${work.nome}". Posteriormente, os exemplares foram encaminhados ao Laboratório Model Engenharia para a execução do ensaio de resistência à compressão, conforme os procedimentos estabelecidos na norma ABNT NBR 5739:2007. O experimento seguiu estritamente as determinações da norma referenciada, desde o preparo prévio das amostras até a realização do ensaio propriamente dito, concluindo com o registro detalhado de todos os dados obtidos.`,
          size: 18,
        }),
      ],
      spacing: { before: 100, after: 160 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "5. Resultados:", bold: true, size: 18 })],
      spacing: { before: 200, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "As massas específicas utilizadas para calcular a tensão de ruptura foram obtidas a partir das dimensões e massa de cada corpo de prova. As características do concreto, extraídas da nota fiscal, estão descritas abaixo:",
          size: 18,
        }),
      ],
      spacing: { after: 160 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Fornecedor de concreto: ", bold: true, size: 18 }),
        new TextRun({
          text: firstLoad.fornecedor_concreto || "-",
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Data de concretagem: ", bold: true, size: 18 }),
        new TextRun({
          text: formatDate(firstLoad.data_moldagem),
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Resistência característica (fck): ",
          bold: true,
          size: 18,
        }),
        new TextRun({
          text: `${firstLoad.fck_mpa} MPa`,
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Abatimento (slump): ", bold: true, size: 18 }),
        new TextRun({
          text: `${firstLoad.slump_cm || "-"} mm`,
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Elemento estrutural: ", bold: true, size: 18 }),
        new TextRun({
          text: `${firstLoad.pavimento || "-"} - ${firstLoad.peca || "-"}`,
          color: "CC0000",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Os resultados dos ensaios realizados estão apresentados no Quadro ${work.codigo}:`,
          size: 18,
        }),
      ],
      spacing: { after: 120 },
    })
  );

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "NF",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Cam.",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Vol. (m³)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Fck (MPa)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Slump (mm)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Amostra",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Idade (dias)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Data Rompimento",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Carga (kN)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "f0f0f0", type: ShadingType.SOLID },
          children: [
            new Paragraph({
              text: "Res. (MPa)",
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, before: 0 },
            }),
          ],
        }),
      ],
    }),
  ];

  samples.forEach((sample: any) => {
    const load = loads.find((l: any) => l.id === sample.carga_id);
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: load?.nota_fiscal || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: load?.caminhao || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: load?.volume_m3?.toString() || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: load?.fck_mpa?.toString() || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: load?.slump_cm || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: sample.numero_laboratorio.toString(),
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: sample.idade_dias?.toString() || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: formatDate(sample.data_prevista_rompimento),
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: sample.carga_kn?.toFixed(1) || "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: sample.resistencia_mpa
                  ? Number(sample.resistencia_mpa).toFixed(1)
                  : "-",
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, before: 0 },
              }),
            ],
          }),
        ],
      })
    );
  });

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Quadro ${work.codigo} - Resultados dos ensaios de compressão axial`,
          italics: true,
          size: 16,
        }),
      ],
      spacing: { before: 80, after: 200 },
      alignment: AlignmentType.CENTER,
    })
  );

  Object.keys(samplesByAge)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((ageStr) => {
      const age = Number(ageStr);
      const ageSamples = samplesByAge[age];
      const avgResistance =
        ageSamples.reduce(
          (sum: number, s: any) => sum + (Number(s.resistencia_mpa) || 0),
          0
        ) / ageSamples.length;

      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Resistência média aos ${age} dias: `,
              bold: true,
              size: 18,
            }),
            new TextRun({
              text: `${avgResistance.toFixed(1)} MPa`,
              bold: true,
              color: "00AA00",
              size: 18,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "6. Equipamentos:", bold: true, size: 18 }),
      ],
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Prensa hidráulica: ", bold: true, size: 18 }),
        new TextRun({
          text: "EMIC - modelo DL 200000, cap. 2000 kN",
          size: 18,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Paquímetro digital: ", bold: true, size: 18 }),
        new TextRun({ text: "Mitutoyo, Resolução: 0,01 mm", size: 18 }),
      ],
      spacing: { after: 60 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "7. Observações:", bold: true, size: 18 }),
      ],
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Este Relatório de Ensaio atende aos requisitos da norma ABNT NBR ISO/IEC 17025:2017 e refere-se exclusivamente às amostras ensaiadas.",
          size: 18,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Os corpos-de-prova foram moldados e curados conforme NBR 5738:2015.",
          size: 18,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Os ensaios foram realizados conforme NBR 5739:2018.",
          size: 18,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• As amostras foram retificadas previamente ao ensaio.",
          size: 18,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({ text: "", spacing: { before: 600 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "_____________________________________________",
          size: 18,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Eng. Civil Felipe Model", bold: true, size: 18 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "CREA/SC 12345-6", size: 18 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Responsável Técnico", size: 18 })],
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push(
    new Paragraph({ text: "", spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "________________________________________________________________________________",
          size: 16,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Model Engenharia e Tecnologia Ltda - Via Morro Azul, 450 - Três Cachoeiras/SC",
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Telefone: (51) 3546-1234 | Email: contato@modelengenharia.com.br",
          size: 16,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: sections,
      },
    ],
  });

  return doc;
}
