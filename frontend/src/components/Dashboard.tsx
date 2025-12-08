import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useData } from '../contexts/DataContext';
import { Sample } from '../types';
import { Package, TestTube, AlertTriangle, Hammer, ArrowRight } from 'lucide-react';

const MAX_SAMPLES_DISPLAY = 5;

export function Dashboard() {
  const { companies, works, loads, samples } = useData();

  const [pendingSamples, setPendingSamples] = useState<Sample[]>(
    [],
  );
  const [todayTests, setTodayTests] = useState<Sample[]>([]);
  const [tomorrowTests, setTomorrowTests] = useState<Sample[]>([]);
  const [next7DaysTests, setNext7DaysTests] = useState<Sample[]>([]);
  const [overdueTests, setOverdueTests] = useState<Sample[]>([]);
  const [showAllToday, setShowAllToday] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"overdue" | "today" | "tomorrow" | "week">("today");

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0];
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];
    
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysISO = in7Days.toISOString().split('T')[0];

    const pending = samples.filter((s) => !s.resistencia_mpa);
    
    const testsOverdue = samples.filter((s) => {
      if (s.resistencia_mpa) return false;
      return s.data_prevista_rompimento && s.data_prevista_rompimento < todayISO;
    });
    
    const testsToday = samples.filter((s) => {
      if (s.resistencia_mpa) return false;
      return s.data_prevista_rompimento === todayISO;
    });

    const testsTomorrow = samples.filter((s) => {
      if (s.resistencia_mpa) return false;
      return s.data_prevista_rompimento === tomorrowISO;
    });

    const testsNext7Days = samples.filter((s) => {
      if (s.resistencia_mpa) return false;
      const testDate = s.data_prevista_rompimento;
      return testDate && testDate > todayISO && testDate <= in7DaysISO;
    });

    // Ordena por número de laboratório
    testsOverdue.sort((a, b) => (a.numero_laboratorio || 0) - (b.numero_laboratorio || 0));
    testsToday.sort((a, b) => (a.numero_laboratorio || 0) - (b.numero_laboratorio || 0));
    testsTomorrow.sort((a, b) => (a.numero_laboratorio || 0) - (b.numero_laboratorio || 0));
    testsNext7Days.sort((a, b) => (a.numero_laboratorio || 0) - (b.numero_laboratorio || 0));

    setPendingSamples(pending);
    setOverdueTests(testsOverdue);
    setTodayTests(testsToday);
    setTomorrowTests(testsTomorrow);
    setNext7DaysTests(testsNext7Days);
  }, [samples]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Visão Geral</h2>
        <p className="text-gray-600">
          Acompanhamento do laboratório em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">
              Empresas Cadastradas
            </CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              {companies.length}
            </div>
            <p className="text-xs text-gray-600">
              Total de empresas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">
              Obras Ativas
            </CardTitle>
            <Hammer className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              {
                works.filter((w) => w.status === "active")
                  .length
              }
            </div>
            <p className="text-xs text-gray-600">
              De {works.length} obras totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">
              Planilhas Registradas
            </CardTitle>
            <TestTube className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{loads.length}</div>
            <p className="text-xs text-gray-600">
              Total de planilhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">
              Amostras Pendentes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              {pendingSamples.length}
            </div>
            <p className="text-xs text-gray-600">
              Aguardando ensaio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Ensaios Programados</CardTitle>
                <CardDescription>
                  Amostras que devem ser testadas
                </CardDescription>
              </div>
            </div>
            <Tabs value={selectedPeriod} onValueChange={(value: string) => setSelectedPeriod(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overdue" className="relative">
                  Atrasados
                  {overdueTests.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1">
                      {overdueTests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="today" className="relative">
                  Hoje
                  {todayTests.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                      {todayTests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tomorrow" className="relative">
                  Amanhã
                  {tomorrowTests.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                      {tomorrowTests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="week" className="relative">
                  Próximos 7 dias
                  {next7DaysTests.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                      {next7DaysTests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {(() => {
              const currentTests = selectedPeriod === "overdue"
                ? overdueTests
                : selectedPeriod === "today" 
                ? todayTests 
                : selectedPeriod === "tomorrow" 
                ? tomorrowTests 
                : next7DaysTests;
              
              const displayTests = showAllToday ? currentTests : currentTests.slice(0, MAX_SAMPLES_DISPLAY);
              
              return currentTests.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  {selectedPeriod === "overdue"
                    ? "Nenhum ensaio atrasado"
                    : selectedPeriod === "today" 
                    ? "Nenhum ensaio programado para hoje"
                    : selectedPeriod === "tomorrow"
                    ? "Nenhum ensaio programado para amanhã"
                    : "Nenhum ensaio programado para os próximos 7 dias"}
                </p>
              ) : (
                <>
                  {selectedPeriod === "overdue" && overdueTests.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">
                        {overdueTests.length === 1 
                          ? "1 ensaio está atrasado e precisa ser realizado urgentemente"
                          : `${overdueTests.length} ensaios estão atrasados e precisam ser realizados urgentemente`
                        }
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {displayTests.map((sample) => {
                      const load = loads.find(
                        (l) => l.id === sample.carga_id,
                      );
                      const work = works.find(
                        (w) => w.id === load?.obra_id,
                      );
                      
                      // Formata a data para exibição nos próximos 7 dias e atrasados
                      let dateDisplay = "";
                      if ((selectedPeriod === "week" || selectedPeriod === "overdue") && sample.data_prevista_rompimento) {
                        const testDate = new Date(sample.data_prevista_rompimento + "T00:00:00");
                        dateDisplay = testDate.toLocaleDateString("pt-BR", { 
                          day: "2-digit", 
                          month: "2-digit" 
                        });
                      }
                      
                      return (
                        <div
                          key={sample.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            selectedPeriod === "overdue" 
                              ? "bg-red-50 border border-red-200" 
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-gray-900">
                              {selectedPeriod === "overdue" && (
                                <AlertTriangle className="inline h-4 w-4 text-red-600 mr-1 mb-1" />
                              )}
                              Nº Lab: <span className="text-blue-600">{sample.numero_laboratorio}</span>
                              {dateDisplay && (
                                <span className={`ml-3 ${selectedPeriod === "overdue" ? "text-red-600" : "text-gray-500"}`}>
                                  ({dateDisplay})
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {work?.nome} - Planilha #{load?.numero_planilha} - {sample.idade_dias} dias
                            </p>
                          </div>
                          <Badge variant={selectedPeriod === "overdue" ? "destructive" : "outline"}>
                            {load?.fck_mpa} MPa
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  {currentTests.length > MAX_SAMPLES_DISPLAY && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setShowAllToday(!showAllToday)}
                      >
                        {showAllToday ? (
                          <>Mostrar menos</>
                        ) : (
                          <>
                            Ver todas as {currentTests.length} amostras
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Amostras</CardTitle>
            <CardDescription>
              Status das amostras no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Total de Amostras
                </span>
                <span className="text-gray-900">
                  {samples.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Com Resultado
                </span>
                <span className="text-gray-900">
                  {samples.filter((s) => s.resistencia_mpa).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Aguardando Ensaio
                </span>
                <span className="text-gray-900">
                  {pendingSamples.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Taxa de Conclusão
                </span>
                <span className="text-gray-900">
                  {samples.length > 0
                    ? `${Math.round((samples.filter((s) => s.resistencia_mpa).length / samples.length) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}