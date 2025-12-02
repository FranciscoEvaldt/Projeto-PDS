import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Work, Load, Sample, Company } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottom: '2px solid #000',
    paddingBottom: 8,
  },
  logo: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.3,
  },
  labInfo: {
    textAlign: 'right',
    fontSize: 8,
    lineHeight: 1.4,
  },
  title: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 5,
  },
  reportNumber: {
    textAlign: 'center',
    fontSize: 10,
    color: '#CC0000',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 3,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  fieldLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  fieldValue: {
    color: '#CC0000',
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
  },
  table: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #000',
    borderTop: '1px solid #000',
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #ccc',
    padding: 5,
    fontSize: 7,
  },
  col1: { width: '8%' },
  col2: { width: '8%' },
  col3: { width: '8%' },
  col4: { width: '8%' },
  col5: { width: '8%' },
  col6: { width: '12%' },
  col7: { width: '12%' },
  col8: { width: '20%' },
  col9: { width: '8%' },
  col10: { width: '8%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #000',
    paddingTop: 8,
    fontSize: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  footerContact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
    fontSize: 8,
  },
  blackBar: {
    height: 12,
    backgroundColor: '#000',
    marginTop: 4,
  },
  bullet: {
    marginLeft: 15,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  observations: {
    marginLeft: 20,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  signature: {
    marginTop: 15,
    marginBottom: 10,
  },
  signatureLine: {
    borderTop: '1px solid #000',
    width: 200,
    marginTop: 30,
  },
  disclaimer: {
    fontSize: 7,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
    lineHeight: 1.4,
  },
  textBlock: {
    lineHeight: 1.5,
    marginBottom: 8,
    fontSize: 9,
  },
  equipmentLabel: {
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    marginBottom: 4,
    fontSize: 9,
  },
});

interface ConcreteTestReportProps {
  work: Work;
  loads: Load[];
  samples: Sample[];
  companies: Company[];
}

export function ConcreteTestReport({ work, loads, samples }: ConcreteTestReportProps) {
  const reportNumber = `${new Date().getFullYear()}/${loads[0]?.invoice_number?.toString().padStart(2, '0') || '01'}`;
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Agrupa amostras por idade
  const samplesByAge = samples.reduce((acc, sample) => {
    const age = sample.idade_dias;
    if (!acc[age]) acc[age] = [];
    acc[age].push(sample);
    return acc;
  }, {} as Record<number, Sample[]>);

  const ages = Object.keys(samplesByAge).map(Number).sort((a, b) => a - b);

  return (
    <Document>
      {/* Página 1 */}
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.logo}>MODEL{'\n'}ENGENHARIA & TECNOLOGIA</Text>
          <View style={styles.labInfo}>
            <Text>Model Engenharia e Tecnologia Ltda</Text>
            <Text>Via Morro Azul, 450</Text>
            <Text>CEP: 95.780-000</Text>
            <Text>Três Cachoeiras (SC)</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>FG 024 - RELATÓRIO DE ENSAIO</Text>
        <Text style={styles.reportNumber}>Relatório nº {reportNumber}</Text>

        {/* 1. Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Dados do cliente</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Razão social: </Text>
            <Text style={styles.fieldValue}>{work.empresa_id}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Endereço: </Text>
            <Text style={styles.fieldValue}>{work.address || 'Não informado'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Orçamento/contrato: </Text>
            <Text style={styles.fieldValue}>{work.contrato || 'Não informado'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>A/C – </Text>
            <Text style={styles.fieldValue}>Cliente</Text>
          </View>
        </View>

        {/* 2. Responsáveis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Responsáveis:</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Relatório de ensaio autorizado por: </Text>
            <Text style={styles.fieldValue}>Eng. Civil Felipe Model.</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Responsável técnico: </Text>
            <Text style={styles.fieldValue}>Eng. Civil Felipe Model.</Text>
          </View>
        </View>

        {/* 3. Amostras */}
       {ages.map(age => {
          const ageSamples = samplesByAge[age];
          return (
            <View key={age} style={styles.section}>
              <Text style={styles.sectionTitle}>Amostras - {age} dias</Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.col1}>Seq.</Text>
                  <Text style={styles.col2}>Nota</Text>
                  <Text style={styles.col3}>Volume m³</Text>
                  <Text style={styles.col4}>Nº da amostra</Text>
                  <Text style={styles.col5}>Idade do ensaio</Text>
                  <Text style={styles.col6}>Data moldagem</Text>
                  <Text style={styles.col7}>Data ensaio</Text>
                  <Text style={styles.col8}>Peça</Text>
                  <Text style={styles.col9}>Dimensões mm</Text>
                  <Text style={styles.col10}>Resistência (MPa)</Text>
                </View>

                {ageSamples.map((sample, idx) => {
                  const load = loads.find(l => l.id === sample.carga_id);
                  const peca = load ? `${load.pavimento || ''} ${load.peca || ''}`.trim() : '-';
                  return (
                    <View key={sample.id} style={styles.tableRow}>
                      <Text style={styles.col1}>{idx + 1}</Text>
                      <Text style={styles.col2}>{load?.nota_fiscal || '-'}</Text>
                      <Text style={styles.col3}>{load?.volume_m3 || '-'}</Text>
                      <Text style={styles.col4}>{sample.numero_laboratorio}</Text>
                      <Text style={styles.col5}>{sample.idade_dias}</Text>
                      <Text style={styles.col6}>{formatDate(load?.molding_date)}</Text>
                      <Text style={styles.col7}>{formatDate(sample.data_prevista_rompimento)}</Text>
                      <Text style={styles.col8}>{peca}</Text>
                      <Text style={styles.col9}>100 x 200</Text>
                      <Text style={styles.col10}>{sample.resistencia_mpa?.toFixed(1) || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            );
        })}

        {/* 4. Objetivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Objetivo: <Text style={styles.fieldValue}>
              ensaio de compressão de corpos de prova cilíndricos normais de concreto, identificados no Quadro {work.code}.
            </Text>
          </Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.textBlock}>
            As amostras analisadas são corpos de prova cilíndricos de concreto, com dimensões aproximadas de 100 mm de
            diâmetro por 200 mm de altura. A coleta do concreto e a moldagem dos corpos de prova foram realizadas pelo cliente
            na obra "{work.name}". Posteriormente, os exemplares foram encaminhados ao Laboratório Model Engenharia para
            a execução do ensaio de resistência à compressão, conforme os procedimentos estabelecidos na norma ABNT NBR
            5739:2018, e idade solicitada pelo contratante. No item 7, FG021, são apresentados os resultados e as demais
            informações referentes aos corpos de prova, conforme fornecidas pelo cliente.
          </Text>
        </View>

        {/* 5. Condições do Ensaio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Condições do ensaio</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Capeamento empregado: </Text>
            <Text>Retífica</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Cura: </Text>
            <Text>Tanque com água, temperatura de 23±2° - Termômetro digital, certificado de calibração 167868R/25.</Text>
          </View>
          <Text style={[styles.fieldLabel, { marginTop: 5, marginBottom: 5 }]}>Equipamentos:</Text>
          <View style={styles.bullet}>
            <Text>
              – Máquina de ensaio de compressão elétrica digital; marca Solotest, Equipamentos. Modelo: 1.501.220. Série:
              298995, Capacidade: 100 (t). Classe 01, Certificado de calibração: 0169/25;
            </Text>
          </View>
          <View style={styles.bullet}>
            <Text>
              – Paquímetro, escala de calibração 0 – 300mm, resolução 0,05mm, certificado de calibração nº 19022/25.
            </Text>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>Elaborado por: Fernanda Rossatto</Text>
            <Text>Aprovado por: Felipe Model</Text>
            <Text>Data de emissão: {getCurrentDate()}</Text>
          </View>
          <View style={styles.footerContact}>
            <Text>📞 (61) 99710-4142</Text>
            <Text>✉️ modelengenharia@gmail.com</Text>
            <Text>📍 Três Cachoeiras/RS</Text>
          </View>
          <View style={styles.blackBar} />
        </View>
      </Page>

      {/* Página 2 */}
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.logo}>MODEL{'\n'}ENGENHARIA & TECNOLOGIA</Text>
          <View style={styles.labInfo}>
            <Text>Model Engenharia e Tecnologia Ltda</Text>
            <Text>Via Morro Azul, 450</Text>
            <Text>CEP: 95.780-000</Text>
            <Text>Três Cachoeiras (SC)</Text>
          </View>
        </View>

        {/* 6. Metodologia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Metodologia:</Text>
          <View style={styles.bullet}>
            <Text>• ABNT NBR 5738:2015 - Concreto - Procedimento para moldagem e cura de corpo-prova;</Text>
          </View>
          <View style={styles.bullet}>
            <Text>• ABNT NBR 5739:2018 - Concreto - Ensaio de compressão de corpos-de-prova cilíndricos.</Text>
          </View>
        </View>

        {/* 7. Resultados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Resultados</Text>
          
          {/* Cabeçalho da Tabela */}
          <View style={styles.table}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 }}>
              FORMULÁRIO GERENCIAL{'\n'}ROMPIMENTO DE CORPOS DE PROVA DE CONCRETO
            </Text>
            <Text style={{ fontSize: 7, textAlign: 'right', marginBottom: 5 }}>
              FG 021{'\n'}REVISÃO: 05{'\n'}{getCurrentDate().replace(/\//g, '/')}
            </Text>
            
            <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 3 }}>Código do cliente:</Text>
            
            {/* Cabeçalho das Colunas */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Seq.</Text>
              <Text style={styles.col2}>Nota</Text>
              <Text style={styles.col3}>Volume m³</Text>
              <Text style={styles.col4}>Nº da amostra</Text>
              <Text style={styles.col5}>Idade do ensaio (dias)</Text>
              <Text style={styles.col6}>Data de moldagem</Text>
              <Text style={styles.col6}>Idade (dias) / Data de ensaio</Text>
              <Text style={styles.col8}>Peça concretada</Text>
              <Text style={[styles.col9, { textAlign: 'center' }]}>Dimensões (mm){'\n'}Diâmetro</Text>
              <Text style={[styles.col9, { textAlign: 'center' }]}>Altura</Text>
              <Text style={[styles.col10, { textAlign: 'center' }]}>Resistência (MPa)</Text>
            </View>

            {/* Linhas da Tabela */}
            {samples.map((sample, index) => {
              const load = loads.find(l => l.id === sample.carga_id);
              const peca = load ? `${load.pavimento || ''} ${load.peca || ''}`.trim() : '-';
              
              return (
                <View key={sample.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{index + 1}</Text>
                  <Text style={styles.col2}>{load?.nota_fiscal || '-'}</Text>
                  <Text style={styles.col3}>{load?.volume_m3 || '-'}</Text>
                  <Text style={styles.col4}>{sample.numero_laboratorio}</Text>
                  <Text style={styles.col5}>{sample.idade_dias}</Text>
                  <Text style={styles.col6}>{formatDate(load?.molding_date)}</Text>
                  <Text style={styles.col6}>
                    {sample.idade_dias} / {formatDate(sample.data_prevista_rompimento)}
                  </Text>
                  <Text style={styles.col8}>{peca}</Text>
                  <Text style={[styles.col9, { textAlign: 'center' }]}>100</Text>
                  <Text style={[styles.col9, { textAlign: 'center' }]}>200</Text>
                  <Text style={[styles.col10, { textAlign: 'center' }]}>
                    {sample.resistencia_mpa?.toFixed(1) || '-'}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={{ fontSize: 7, marginTop: 5 }}>
            ENSAIO REALIZADO DE ACORDO COM A NORMA NBR 5739 = IBRACON
          </Text>
          <Text style={{ fontSize: 7, marginBottom: 10 }}>
            * ROMPIMENTO NÃO FOI REALIZADO
          </Text>
          <Text style={{ fontSize: 8, textAlign: 'right', marginTop: 10 }}>Assinatura:</Text>
        </View>

        {/* 8. Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Observações:</Text>
          <View style={styles.observations}>
            <Text>
              • Os resultados apresentados neste relatório referem-se exclusivamente às amostras ensaiadas, nas
              condições e datas especificadas. Não se estende qualquer garantia ou representatividade a outras amostras
              não submetidas ao ensaio;
            </Text>
          </View>
          <View style={styles.observations}>
            <Text>
              • Este relatório técnico, contendo XX páginas, foi elaborado pela equipe técnica do Laboratório Model
              Engenharia. Os resultados apresentados são exclusivos para este documento e não devem ser utilizados de
              forma indiscriminada, sendo vedada sua reprodução parcial. A generalização dos resultados para outros
              lotes ou universos ficará sob responsabilidade do cliente.
            </Text>
          </View>
        </View>

        {/* Data de Emissão */}
        <Text style={{ marginTop: 20, marginBottom: 10 }}>
          Emitido em {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}.
        </Text>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Final do relatório - Recomenda-se cautela na divulgação destes resultados. Caso seja necessária a sua publicação, o relatório deve ser
          reproduzido em sua totalidade. A reprodução parcial só é permitida mediante autorização formal e por escrito do laboratório.
        </Text>

        {/* Assinatura */}
        <View style={styles.signature}>
          <Text style={styles.fieldLabel}>Responsável pelo relatório:</Text>
          <Text style={{ marginTop: 10, fontStyle: 'italic' }}>(assinatura)</Text>
          <Text style={{ marginTop: 5 }}>Eng. Civil Felipe Model - CREA/RS 146678.</Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>Elaborado por: Fernanda Rossatto</Text>
            <Text>Aprovado por: Felipe Model</Text>
            <Text>Data de emissão: {getCurrentDate()}</Text>
          </View>
          <View style={styles.footerContact}>
            <Text>📞 (61) 99710-4142</Text>
            <Text>✉️ modelengenharia@gmail.com</Text>
            <Text>📍 Três Cachoeiras/RS</Text>
          </View>
          <View style={styles.blackBar} />
        </View>
      </Page>
    </Document>
  );
}