import { useState } from 'react';
import { Plus, Pencil, Trash2, User as UserIcon, Eye, EyeOff, Shield, UserCog, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { User } from '../services/api';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export function UsersManager() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar se o usuário atual é admin
  if (currentUser?.role !== 'admin') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Acesso Negado</h3>
          <p className="text-red-700 text-center">
            Apenas administradores podem acessar o gerenciamento de usuários.
          </p>
        </CardContent>
      </Card>
    );
  }

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    role: 'user',
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'user',
    });
    setShowPassword(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validação
      if (!formData.username || !formData.password || !formData.name) {
        toast.error('Preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }

      if (formData.username.length < 3) {
        toast.error('O usuário deve ter pelo menos 3 caracteres');
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        setIsSubmitting(false);
        return;
      }

      await addUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });

      setIsDialogOpen(false);
      resetForm();
      toast.success('Usuário criado com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      if (errorMessage.includes('já existe')) {
        toast.error('Já existe um usuário com esse nome de usuário');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      if (!editingUser.name) {
        toast.error('O nome é obrigatório');
        setIsSubmitting(false);
        return;
      }

      await updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast.success('Usuário atualizado com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar usuário: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (userId === currentUser?.id) {
      toast.error('Você não pode excluir seu próprio usuário');
      return;
    }

    if (username === 'admin') {
      toast.error('O usuário admin não pode ser excluído');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      try {
        await deleteUser(userId);
        toast.success('Usuário excluído com sucesso!');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error(`Erro ao excluir usuário: ${errorMessage}`);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Administrador
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <UserIcon className="h-3 w-3" />
        Usuário
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            Crie e gerencie usuários do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo usuário
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite o nome de usuário"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 3 caracteres, sem espaços
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite a senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    autoComplete="new-password"
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
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Administradores têm acesso total ao sistema
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input
                  value={editingUser.username}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O nome de usuário não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Perfil *</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: 'admin' | 'user') => setEditingUser({ ...editingUser, role: value })}
                  disabled={editingUser.username === 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {editingUser.username === 'admin' && (
                  <p className="text-xs text-muted-foreground">
                    O perfil do admin não pode ser alterado
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Usuários Cadastrados
          </CardTitle>
          <CardDescription>
            Total: {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          {user.username}
                          {user.username === currentUser?.username && (
                            <Badge variant="outline" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Editar usuário"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.username)}
                            disabled={user.username === currentUser?.username || user.username === 'admin'}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-blue-900">Dicas de Segurança</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Use senhas fortes com pelo menos 6 caracteres</li>
                <li>Combine letras, números e caracteres especiais</li>
                <li>Não compartilhe credenciais entre usuários</li>
                <li>Revise periodicamente os acessos ao sistema</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UsersManager;