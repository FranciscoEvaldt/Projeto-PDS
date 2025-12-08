import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatDateBR } from '../utils/dateHelpers';
import { Packer } from 'docx';
import { generateConcreteTestReport } from './DocxReportGenerator';
import type { Work, Load, Sample } from '../types';

export function ReportsManager() {
  const { companies, works, loads, samples } = useData();
  const [selectedWork, setSelectedWork] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Função para gerar e baixar o DOCX
  const handleDownloadDocx = async (key: string, work: Work, sheetLoads: Load[], sheetSamples: Sample[]) => {
    try {
      setGeneratingReport(key);
      
      // Busca a empresa relacionada à obra
      const company = companies.find(c => c.id === work.empresa_id);
      if (!company) {
        alert('Empresa não encontrada para esta obra.');
        return;
      }
      
      const docx = generateConcreteTestReport(work, company, sheetLoads, sheetSamples);
      const blob = await Packer.toBlob(docx);
      
      // Extrai a idade das amostras (assumindo que todas tem a mesma idade)
      const idade = sheetSamples[0]?.idade_dias || '';
      const idadeSuffix = idade ? `_${idade}dias` : '';
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_${work.codigo}_Planilha_${sheetLoads[0].numero_planilha}${idadeSuffix}.docx`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar DOCX:', error);
      alert('Erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setGeneratingReport(null);
    }
  };

  // Gera lista de meses disponíveis baseado nas datas de moldagem
  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    loads.forEach(load => {
      if (load.data_moldagem) {
        const date = new Date(load.data_moldagem + 'T00:00:00');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthKey);
      }
    });
    return Array.from(monthsSet).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  // Formata o mês para exibição
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Filtra cargas por obra e mês
  const filteredLoads = loads.filter(load => {
    const matchesWork = selectedWork === 'all' || load.obra_id === Number(selectedWork);
    
    if (!matchesWork) return false;
    if (selectedMonth === 'all') return true;
    
    if (!load.data_moldagem) return false;
    const date = new Date(load.data_moldagem + 'T00:00:00');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthKey === selectedMonth;
  });

  // Agrupa cargas por planilha
  const loadsBySheet = filteredLoads.reduce((acc, load) => {
    const key = `${load.obra_id}-${load.numero_planilha}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(load);
    return acc;
  }, {} as Record<string, typeof loads>);

  // Agrupa amostras por planilha e idade
  const getSamplesBySheetAndAge = (sheetLoads: typeof loads) => {
    const sheetSamples = samples.filter(s => 
      sheetLoads.some(load => load.id === s.carga_id) && s.idade_dias !== undefined
    );
    
    // Agrupa por idade
    const byAge = sheetSamples.reduce((acc, sample) => {
      const age = sample.idade_dias!; // Garantido que não é undefined pelo filter acima
      if (!acc[age]) {
        acc[age] = [];
      }
      acc[age].push(sample);
      return acc;
    }, {} as Record<number, typeof samples>);
    
    return byAge;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração de Relatórios Técnicos</CardTitle>
        <CardDescription>
          Gere relatórios de ensaio em Word (.docx) - editável após geração
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <label className="text-sm mb-2 block">Filtrar por Obra</label>
            <Select value={selectedWork} onValueChange={setSelectedWork}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as obras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as obras</SelectItem>
                {works.map(work => (
                  <SelectItem key={work.id} value={work.id.toString()}>
                    {work.codigo} - {work.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm mb-2 block">Filtrar por Período</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📅 Todos os períodos</SelectItem>
                {availableMonths.map(monthKey => (
                  <SelectItem key={monthKey} value={monthKey}>
                    {formatMonthLabel(monthKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Planilhas */}
        {Object.keys(loadsBySheet).length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhuma planilha encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(loadsBySheet).map(([key, sheetLoads]) => {
              const work = works.find(w => w.id === sheetLoads[0].obra_id);
              const workCompany = companies.find(c => c.id === work?.empresa_id);
              const samplesByAge = getSamplesBySheetAndAge(sheetLoads);
              const ages = Object.keys(samplesByAge).map(Number).sort((a, b) => a - b);

              return (
                <div key={key} className="space-y-3">
                  {/* Cabeçalho da Planilha */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-4 pb-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {work?.nome || 'Obra não encontrada'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Planilha #{sheetLoads[0].numero_planilha} • {work?.codigo} • {sheetLoads.length} carga(s)
                      </p>
                      
                      <div className="grid grid-cols-3 gap-x-6 text-sm">
                        <div>
                          <span className="text-gray-600">Empresa:</span>
                          <span className="ml-2 font-medium">{workCompany?.nome || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fornecedor:</span>
                          <span className="ml-2 font-medium">{sheetLoads[0].fornecedor_concreto || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Data Moldagem:</span>
                          <span className="ml-2 font-medium">{formatDateBR(sheetLoads[0].data_moldagem)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cards por Idade de Rompimento */}
                  <div className="ml-6 space-y-3">
                    {ages.map(age => {
                      const ageSamples = samplesByAge[age];
                      const testedSamples = ageSamples.filter(s => s.resistencia_mpa);
                      const allTested = ageSamples.length > 0 && ageSamples.length === testedSamples.length;
                      const pdfKey = `${key}-${age}`;

                      return (
                        <Card key={age} className="border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold">
                                    Relatório {age} dias
                                  </h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    allTested 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {testedSamples.length}/{ageSamples.length} ensaiadas
                                  </span>
                                </div>
                                
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="text-gray-600">Amostras:</span>
                                    <span className="ml-2 font-mono">
                                      {ageSamples.map(s => s.numero_laboratorio).join(', ')}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Data prevista de rompimento:</span>
                                    <span className="ml-2 font-medium">
                                      {formatDateBR(ageSamples[0].data_prevista_rompimento)}
                                    </span>
                                  </div>
                                  {allTested && (
                                    <div>
                                      <span className="text-gray-600">Resistência média:</span>
                                      <span className="ml-2 font-medium text-green-700">
                                        {(ageSamples.reduce((sum, s) => sum + (Number(s.resistencia_mpa) || 0), 0) / ageSamples.length).toFixed(1)} MPa
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {!allTested && (
                                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                                    ⚠️ Aguardando rompimento das amostras
                                  </div>
                                )}
                              </div>

                              <div className="ml-4">
                                {allTested ? (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleDownloadDocx(pdfKey, work!, sheetLoads, ageSamples)}
                                      disabled={generatingReport === pdfKey}
                                      size="sm"
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      {generatingReport === pdfKey ? 'Gerando...' : 'Gerar DOCX'}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button disabled variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF Bloqueado
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Tabela de Cargas (opcional - pode remover se preferir) */}
                  <div className="ml-6">
                    <Card>
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-3 text-sm">Detalhamento das Cargas</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Caminhão</TableHead>
                              <TableHead>NF</TableHead>
                              <TableHead>Volume</TableHead>
                              <TableHead>FCK</TableHead>
                              <TableHead>Pavimento/Peça</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sheetLoads.map(load => (
                              <TableRow key={load.id}>
                                <TableCell className="font-mono">{load.caminhao}</TableCell>
                                <TableCell>{load.nota_fiscal}</TableCell>
                                <TableCell>{load.volume_m3} m³</TableCell>
                                <TableCell>{load.fck_mpa} MPa</TableCell>
                                <TableCell>
                                  {load.pavimento || '-'} - {load.peca || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}