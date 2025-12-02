import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from './ui/dialog';
import { Badge } from './ui/badge';
import { FlaskConical, Clock } from 'lucide-react';
import {type Sample } from '../types';
import { toast } from 'sonner';
import { useStorage } from '../hooks/useStorage';

export function SamplesManager() {
  const { works, loads, samples, updateSample } = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [resultData, setResultData] = useState({
    kgf: '',
    observations: '',
  });

  const calculateResult = (kgf: number) => {
    const gravidade = 10;
    const area = 7.854;
    return (kgf * gravidade) / area;
  };

  const handleRegisterResult = (sample: Sample) => {
    setSelectedSample(sample);
    setResultData({
      kgf: sample.resistencia_mpa ? (sample.resistencia_mpa * 7.854 / 10).toFixed(2) : '',
      observations: sample.observacoes || '',
    });
    setIsDialogOpen(true);
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedSample) return;

  const resultMPa = calculateResult(Number(resultData.kgf));

  updateSample(selectedSample.id, {
    resistencia_mpa: resultMPa,
    observacoes: resultData.observations,
    data_rompimento: new Date().toISOString(),
    status: 'testado'
  });

  toast.success('Resultado registrado com sucesso!');
  setIsDialogOpen(false);
  setSelectedSample(null);
  setResultData({ kgf: '', observations: '' });
};


  const getComplianceStatus = (result: number, targetFck: number) => {
    const percentage = (result / targetFck) * 100;
    if (percentage >= 100) {
      return { label: 'Aprovado', variant: 'default' as const, color: 'text-green-600' };
    } else if (percentage >= 90) {
      return { label: 'Atenção', variant: 'outline' as const, color: 'text-yellow-600' };
    } else {
      return { label: 'Reprovado', variant: 'destructive' as const, color: 'text-red-600' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Amostras</CardTitle>
        <CardDescription>Acompanhe as amostras e registre os resultados dos ensaios</CardDescription>
      </CardHeader>
      <CardContent>
        {samples.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhuma amostra gerada. Cadastre relatórios de concreto para gerar amostras automaticamente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Nº Carga</TableHead>
                <TableHead>FCK</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Data Moldagem</TableHead>
                <TableHead>Data Ensaio</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => {
                const load = loads.find(l => l.id === sample.carga_id);
                const work = works.find(w => w.id === load?.obra_id);
                const compliance = sample.resistencia_mpa && load ? getComplianceStatus(sample.resistencia_mpa, load.fck_mpa) : null;

                return (
                  <TableRow key={sample.id}>
                    <TableCell>{sample.numero_laboratorio}</TableCell>
                    <TableCell>{work?.name || 'N/A'}</TableCell>
                    <TableCell>{load?.invoice_number|| 'N/A'}</TableCell>
                    <TableCell>{load?.fck_mpa} MPa</TableCell>
                    <TableCell>{sample.idade_dias} dias</TableCell>
                    <TableCell>{new Date(sample.data_moldagem).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(sample.data_prevista_rompimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {sample.resistencia_mpa ? (
                        <span className={compliance?.color}>
                          {sample.resistencia_mpa.toFixed(2)} MPa
                        </span>
                      ) : (
                        <span className="text-gray-500">Pendente</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sample.resistencia_mpa ? (
                        compliance && <Badge variant={compliance.variant}>{compliance.label}</Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Aguardando
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={sample.resistencia_mpa ? 'outline' : 'default'}
                        onClick={() => handleRegisterResult(sample)}
                      >
                        <FlaskConical className="w-4 h-4 mr-2" />
                        {sample.resistencia_mpa ? 'Editar' : 'Registrar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Resultado do Ensaio</DialogTitle>
              <DialogDescription>
                Amostra: {selectedSample?.numero_laboratorio}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="result">Resistência à Compressão (MPa)</Label>
                  <Input
                    id="result"
                    type="number"
                    step="0.01"
                    value={resultData.kgf}
                    onChange={(e) => setResultData({ ...resultData, kgf: e.target.value })}
                    placeholder="Ex: 28.5"
                    required
                  />
                  {resultData.kgf &&(
                    <p className="text-sm text-gray-600">
                      Resultado calculado: <strong>{calculateResult(Number(resultData.kgf)).toFixed(2)} MPa</strong>
                    </p>
                  )}
                  {selectedSample && loads.find(l => l.id === selectedSample.carga_id) && (
                    <p className="text-sm text-gray-600">
                      FCK esperado: {loads.find(l => l.id === selectedSample.carga_id)?.fck_mpa} MPa
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={resultData.observations}
                    onChange={(e) => setResultData({ ...resultData, observations: e.target.value })}
                    placeholder="Observações sobre o ensaio (opcional)"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar Resultado</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
