import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Building2, Hammer, TestTube, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { useStorage, type Sample } from '../hooks/useStorage';

export function Dashboard() {
  const { companies } = useStorage();
  const { works } = useStorage();
  const { loads } = useStorage();
  const { samples } = useStorage();
  const [pendingSamples, setPendingSamples] = useState<Sample[]>([]);
  const [todayTests, setTodayTests] = useState<Sample[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pending = samples.filter(s => !s.result);
    const testsToday = samples.filter(s => {
      if (s.result) return false;
      const testDate = new Date(s.testDate);
      testDate.setHours(0, 0, 0, 0);
      return testDate.getTime() === today.getTime();
    });

    setPendingSamples(pending);
    setTodayTests(testsToday);
  }, [samples]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Visão Geral</h2>
        <p className="text-gray-600">Acompanhamento do laboratório em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">Empresas Cadastradas</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{companies.length}</div>
            <p className="text-xs text-gray-600">Total de empresas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">Obras Ativas</CardTitle>
            <Hammer className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{works.filter(w => w.status === 'active').length}</div>
            <p className="text-xs text-gray-600">De {works.length} obras totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">Relatórios Registrados</CardTitle>
            <TestTube className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{loads.length}</div>
            <p className="text-xs text-gray-600">Total de relatórios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">Amostras Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{pendingSamples.length}</div>
            <p className="text-xs text-gray-600">Aguardando ensaio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ensaios Programados para Hoje</CardTitle>
            <CardDescription>Amostras que devem ser testadas hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {todayTests.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhum ensaio programado para hoje</p>
            ) : (
              <div className="space-y-3">
                {todayTests.map(sample => {
                  const load = loads.find(l => l.id === sample.loadId);
                  const work = works.find(w => w.id === load?.workId);
                  return (
                    <div key={sample.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900">{sample.code}</p>
                        <p className="text-sm text-gray-600">{work?.name} - {sample.age} dias</p>
                      </div>
                      <Badge variant="outline">{load?.fck} MPa</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Amostras</CardTitle>
            <CardDescription>Status das amostras no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total de Amostras</span>
                <span className="text-gray-900">{samples.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Com Resultado</span>
                <span className="text-gray-900">{samples.filter(s => s.result).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Aguardando Ensaio</span>
                <span className="text-gray-900">{pendingSamples.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Taxa de Conclusão</span>
                <span className="text-gray-900">
                  {samples.length > 0 
                    ? `${Math.round((samples.filter(s => s.result).length / samples.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
