import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2, UserCog, Shield, User as UserIcon, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '../contexts/useAuth';

interface User {
  id: number;
  username: string;
  password: string;
  nome: string;
  role: 'admin' | 'user';
}

const USERS_STORAGE_KEY = 'concrete-lab-users';

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nome: '',
    role: 'user' as 'admin' | 'user',
  });

  // Carregar usuários do localStorage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nome: '',
      role: 'user',
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar username único
      const usernameExists = users.some(
        (u) => u.username === formData.username && u.id !== editingUser?.id
      );

      if (usernameExists) {
        toast.error('Nome de usuário já existe!');
        setIsSubmitting(false);
        return;
      }

      if (editingUser) {
        // Editar usuário existente
        const updatedUsers = users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                username: formData.username,
                // Só atualiza senha se foi preenchida
                password: formData.password || u.password,
                nome: formData.nome,
                role: formData.role,
              }
            : u
        );
        saveUsers(updatedUsers);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const newUser: User = {
          id: Math.max(0, ...users.map((u) => u.id)) + 1,
          username: formData.username,
          password: formData.password,
          nome: formData.nome,
          role: formData.role,
        };
        saveUsers([...users, newUser]);
        toast.success('Usuário criado com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Não preenche a senha por segurança
      nome: user.nome,
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: number) => {
    const userToDelete = users.find((u) => u.id === userId);
    
    // Impedir exclusão do próprio usuário logado
    if (userToDelete?.username === currentUser?.username) {
      toast.error('Você não pode excluir seu próprio usuário!');
      return;
    }

    // Impedir exclusão se for o último admin
    if (userToDelete?.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error('Não é possível excluir o último administrador!');
        return;
      }
    }

    if (confirm(`Tem certeza que deseja excluir o usuário "${userToDelete?.nome}"?`)) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
      toast.success('Usuário excluído com sucesso!');
    }
  };

  const handleResetPassword = (user: User) => {
    const newPassword = prompt(
      `Digite a nova senha para o usuário "${user.nome}":`
    );

    if (newPassword && newPassword.length >= 6) {
      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      saveUsers(updatedUsers);
      toast.success('Senha redefinida com sucesso!');
    } else if (newPassword) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
    }
  };

  // Verificar se o usuário atual é admin
  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Apenas administradores têm acesso ao gerenciamento de usuários.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Crie e gerencie os usuários do sistema
            </CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open: boolean) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? 'Edite as informações do usuário'
                    : 'Preencha os dados para criar um novo usuário'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username">Usuário (Login) *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Ex: joao.silva"
                      required
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500">
                      Será usado para fazer login no sistema
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Mínimo 6 caracteres"
                      required={!editingUser}
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">Tipo de Usuário *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'admin' | 'user') =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Usuário - Acesso padrão ao sistema
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Administrador - Acesso total
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {editingUser ? 'Atualizar' : 'Criar Usuário'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                📊 <strong>{users.length}</strong> usuário(s) cadastrado(s) •{' '}
                <strong>{users.filter((u) => u.role === 'admin').length}</strong>{' '}
                administrador(es) •{' '}
                <strong>{users.filter((u) => u.role === 'user').length}</strong>{' '}
                usuário(s) padrão
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.username === currentUser?.username && (
                          <Badge variant="secondary" className="text-xs">
                            Você
                          </Badge>
                        )}
                        <span className="font-medium">{user.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {user.username}
                      </code>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge className="flex items-center gap-1 w-fit">
                          <Shield className="w-3 h-3" />
                          Administrador
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <UserIcon className="w-3 h-3" />
                          Usuário
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          title="Redefinir senha"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Editar usuário"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.username === currentUser?.username}
                          title={
                            user.username === currentUser?.username
                              ? 'Você não pode excluir seu próprio usuário'
                              : 'Excluir usuário'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
