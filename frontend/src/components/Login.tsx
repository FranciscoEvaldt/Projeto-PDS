import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FlaskConical, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await login(username, password);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Sistema de Gestão</h1>
          <p className="text-gray-600">Laboratório de Concreto</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
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

            {/* Informações de Teste */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-2">
                <strong>👤 Usuários de teste:</strong>
              </p>
              <div className="text-xs text-blue-800 space-y-1">
                <p>
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p>
                  <strong>Técnico:</strong> tecnico / tecnico123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Sistema de Gestão de Laboratório
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Entre em contato com o administrador para obter acesso
          </p>
        </div>
      </div>
    </div>
  );
}
