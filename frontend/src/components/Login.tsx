import { useState } from 'react';
import { FlaskConical, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.');
        setPassword(''); // Limpar senha em caso de erro
      }
    } catch (error) {
      setError('Erro ao tentar fazer login. Verifique sua conexão com o servidor.');
      toast.error('Erro ao conectar com o servidor');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Sistema de Gestão</h1>
          <p className="text-gray-600">Laboratório de Concreto - Model Engenharia</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Informações de Acesso */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>🔐 Credenciais de Acesso:</strong>
              </p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>
                  <strong>Usuário:</strong> <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code>
                </p>
                <p>
                  <strong>Senha:</strong> <code className="bg-blue-100 px-2 py-0.5 rounded">admin123</code>
                </p>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-shake">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 mb-1">Erro de Autenticação</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2024 Model Engenharia - Laboratório de Concreto</p>
        </div>
      </div>
    </div>
  );
}

export default Login;