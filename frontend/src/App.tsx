import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { FlaskConical, Building2, Hammer, TestTube, ClipboardCheck, FileText } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CompaniesManager } from './components/CompaniesManager';
import { WorksManager } from './components/WorksManager';
import { LoadsManager } from './components/LoadsManager';
import { SamplesManager } from './components/SamplesManager';
import { ReportsManager } from './components/ReportsManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Sistema de Gestão - Laboratório de Concreto</h1>
              <p className="text-gray-600 text-sm">Controle de Corpos de Prova e Ensaios</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="works" className="flex items-center gap-2">
              <Hammer className="w-4 h-4" />
              Obras
            </TabsTrigger>
            <TabsTrigger value="loads" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="samples" className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Amostras
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Emitir PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="companies">
            <CompaniesManager />
          </TabsContent>

          <TabsContent value="works">
            <WorksManager />
          </TabsContent>

          <TabsContent value="loads">
            <LoadsManager />
          </TabsContent>

          <TabsContent value="samples">
            <SamplesManager />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
