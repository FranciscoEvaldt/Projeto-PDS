import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { toast } from 'sonner';

export function ReportsManager() {
  const { companies, works, loads, samples } = useStorage();
  const [selectedWork, setSelectedWork] = useState('');
  const [selectedLoad, setSelectedLoad] = useState('');

  const generatePDF = () => {
    if (!selectedLoad) {
      toast.error('Selecione uma carga para gerar o relatório');
      return;
    }

    const load = loads.find(l => l.id === selectedLoad);
    const work = works.find(w => w.id === load?.workId);
    const company = companies.find(c => c.id === work?.companyId);
    const loadSamples = samples.filter(s => s.loadId === selectedLoad);

    if (!load || !work || !company) {
      toast.error('Dados incompletos para geração do relatório');
      return;
    }

    // Criar HTML do relatório
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Ensaio - ${load.loadNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item {
            padding: 8px;
            background: #f9fafb;
            border-radius: 4px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
          }
          .info-value {
            color: #333;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .approved {
            color: #16a34a;
            font-weight: bold;
          }
          .attention {
            color: #ca8a04;
            font-weight: bold;
          }
          .rejected {
            color: #dc2626;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE ENSAIO DE COMPRESSÃO</h1>
          <p>Laboratório de Concreto</p>
        </div>

        <div class="section">
          <div class="section-title">Dados da Empresa</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Empresa</div>
              <div class="info-value">${company.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CNPJ</div>
              <div class="info-value">${company.cnpj}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contato</div>
              <div class="info-value">${company.contact}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Telefone</div>
              <div class="info-value">${company.phone}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados da Obra</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Obra</div>
              <div class="info-value">${work.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Responsável</div>
              <div class="info-value">${work.responsible}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Endereço</div>
              <div class="info-value">${work.address}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados da Carga</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Número da Carga</div>
              <div class="info-value">${load.loadNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nota Fiscal</div>
              <div class="info-value">${load.invoiceNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data de Moldagem</div>
              <div class="info-value">${new Date(load.deliveryDate).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">FCK (MPa)</div>
              <div class="info-value">${load.fck}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Slump (mm)</div>
              <div class="info-value">${load.slump}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Volume (m³)</div>
              <div class="info-value">${load.volume}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Fornecedor</div>
              <div class="info-value">${work.supplier}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Resultados dos Ensaios</div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Idade (dias)</th>
                <th>Data do Ensaio</th>
                <th>Resultado (MPa)</th>
                <th>% do FCK</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loadSamples.map(sample => {
                const percentage = sample.result ? (sample.result / load.fck) * 100 : 0;
                let statusClass = '';
                let statusText = 'Pendente';
                
                if (sample.result) {
                  if (percentage >= 100) {
                    statusClass = 'approved';
                    statusText = 'Aprovado';
                  } else if (percentage >= 90) {
                    statusClass = 'attention';
                    statusText = 'Atenção';
                  } else {
                    statusClass = 'rejected';
                    statusText = 'Reprovado';
                  }
                }

                return `
                  <tr>
                    <td>${sample.code}</td>
                    <td>${sample.age}</td>
                    <td>${new Date(sample.testDate).toLocaleDateString('pt-BR')}</td>
                    <td>${sample.result ? sample.result.toFixed(2) : '-'}</td>
                    <td>${sample.result ? percentage.toFixed(1) + '%' : '-'}</td>
                    <td class="${statusClass}">${statusText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${loadSamples.some(s => s.observations) ? `
          <div class="section">
            <div class="section-title">Observações</div>
            ${loadSamples.filter(s => s.observations).map(sample => `
              <p><strong>${sample.code}:</strong> ${sample.observations}</p>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Sistema de Gestão - Laboratório de Concreto</p>
        </div>
      </body>
      </html>
    `;

    // Criar blob e download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${load.loadNumber.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Relatório gerado com sucesso!');
  };

  const filteredLoads = selectedWork 
    ? loads.filter(l => l.workId === selectedWork)
    : loads;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emitir Relatório em PDF</CardTitle>
        <CardDescription>Emita relatórios técnicos em formato HTML para impressão ou PDF</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="work">Selecione a Obra</Label>
              <Select value={selectedWork} onValueChange={(value) => {
                setSelectedWork(value);
                setSelectedLoad('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma obra" />
                </SelectTrigger>
                <SelectContent>
                  {works.map((work) => {
                    const company = companies.find(c => c.id === work.companyId);
                    return (
                      <SelectItem key={work.id} value={work.id}>
                        {work.name} ({company?.name})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="load">Selecione o Relatório</Label>
              <Select 
                value={selectedLoad} 
                onValueChange={setSelectedLoad}
                disabled={!selectedWork}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um relatório" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLoads.map((load) => {
                    const loadSamples = samples.filter(s => s.loadId === load.id);
                    const completedSamples = loadSamples.filter(s => s.result).length;
                    return (
                      <SelectItem key={load.id} value={load.id}>
                        {load.loadNumber} - FCK {load.fck} MPa ({completedSamples}/{loadSamples.length} ensaios)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedLoad && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-gray-900 mb-3">Resumo do Relatório</h3>
              {(() => {
                const load = loads.find(l => l.id === selectedLoad);
                const work = works.find(w => w.id === load?.workId);
                const company = companies.find(c => c.id === work?.companyId);
                const loadSamples = samples.filter(s => s.loadId === selectedLoad);
                const completedSamples = loadSamples.filter(s => s.result);

                return (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Empresa:</span> {company?.name}</p>
                    <p><span className="text-gray-600">Obra:</span> {work?.name}</p>
                    <p><span className="text-gray-600">Relatório:</span> {load?.loadNumber}</p>
                    <p><span className="text-gray-600">FCK:</span> {load?.fck} MPa</p>
                    <p><span className="text-gray-600">Amostras:</span> {loadSamples.length} total ({completedSamples.length} com resultado)</p>
                  </div>
                );
              })()}
            </div>
          )}

          <Button 
            onClick={generatePDF} 
            disabled={!selectedLoad}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar Relatório (HTML)
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-blue-900">
              <strong>Dica:</strong> O relatório será gerado em formato HTML. 
              Você pode abrir o arquivo em seu navegador e usar a função "Imprimir" 
              (Ctrl+P) para salvar como PDF ou imprimir diretamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
