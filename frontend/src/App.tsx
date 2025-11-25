import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { FlaskConical, Building2, Hammer, TestTube, ClipboardCheck, FileText, LogOut, User, Users } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CompaniesManager } from './components/CompaniesManager';
import { WorksManager } from './components/WorksManager';
import { LoadsManager } from './components/LoadsManager';
import { SamplesManager } from './components/SamplesManager';
import { ReportsManager } from './components/ReportsManager';
import { UsersManager } from './components/UsersManager';
import { Login } from './components/Login';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthProvider';
import { DataProvider } from './contexts/DataProvider';
import { useAuth } from './contexts/useAuth';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Sistema de Gestão - Laboratório de Concreto</h1>
                <p className="text-gray-600 text-sm">Controle de Corpos de Prova e Ensaios</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{user.nome}</p>
                    <p className="text-xs text-gray-600">
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'manager' ? 'Gerente' :
                       user.role === 'user' ? 'Usuário' : 'Visualizador'}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full max-w-5xl">
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
              Planilhas
            </TabsTrigger>
            <TabsTrigger value="samples" className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Amostras
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
            )}
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

          {user?.role === 'admin' && (
            <TabsContent value="users">
              <UsersManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {/* Verificar autenticação */}
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DataProvider>
        <AppContent />
        <Toaster />
      </DataProvider>
    </>
  );
}