import { useState } from 'react';
import { useApiStorage } from './hooks/useApiStorage';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { FlaskConical, Building2, Hammer, TestTube, ClipboardCheck, FileText, LogOut, User, Users } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CompaniesManager } from './components/CompaniesManager';
import { WorksManager } from './components/WorksManager';
import { LoadsManagerNew } from './components/LoadsManagerNew';
import { SamplesManager } from './components/SamplesManager';
import { ReportsManager } from './components/ReportsManager';
import { UsersManager } from './components/UsersManager';
import { Login } from './components/Login';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoading, error, loadAllData } = useApiStorage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  // Mostrar loading enquanto carrega dados da API
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando dados do servidor PostgreSQL...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-lg border-2 border-red-200">
          <div className="text-center mb-6">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl text-gray-900 mb-2">Backend Desconectado</h2>
            <p className="text-gray-600 mb-6">Não foi possível conectar ao servidor PostgreSQL</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 mb-2">
              <strong>Erro:</strong> {error}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg text-gray-900 mb-4">🚀 Como Iniciar o Backend:</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <p className="text-gray-900">Abra um novo terminal</p>
                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs">
                    cd backend
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <p className="text-gray-900">Instale as dependências (primeira vez)</p>
                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs">
                    npm install
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <p className="text-gray-900">Configure o arquivo .env com suas credenciais PostgreSQL</p>
                  <p className="text-xs text-gray-600 mt-1">Veja backend/.env.example</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <p className="text-gray-900">Inicie o servidor</p>
                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs">
                    npm run dev
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => loadAllData()} className="flex-1">
              Tentar Conectar Novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/INSTRUÇÕES_BACKEND.md', '_blank')}
              className="flex-1"
            >
              Ver Instruções Completas
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            O backend deve estar rodando em <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Sistema de Gestão - Laboratório de Concreto</h1>
                <p className="text-gray-600 text-sm">Controle de Corpos de Prova e Ensaios - Model Engenharia</p>
              </div>
            </div>
            
            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.username}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full max-w-5xl ${user?.role === 'admin' ? 'grid-cols-7' : 'grid-cols-6'}`}>
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
              <FileText className="w-4 h-4" />
              Planilhas
            </TabsTrigger>
            <TabsTrigger value="samples" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
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

          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard />
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <CompaniesManager />
          </TabsContent>

          <TabsContent value="works" className="space-y-4">
            <WorksManager />
          </TabsContent>

          <TabsContent value="loads" className="space-y-4">
            <LoadsManagerNew />
          </TabsContent>

          <TabsContent value="samples" className="space-y-4">
            <SamplesManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsManager />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="users" className="space-y-4">
              <UsersManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

function AppWithAuth() {
  const { isAuthenticated, login } = useAuth();

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password);
    if (success) {
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Usuário ou senha incorretos');
    }
    return success;
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;