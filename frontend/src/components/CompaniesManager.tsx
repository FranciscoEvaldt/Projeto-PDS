import { useState } from 'react';
import { Company } from '../hooks/useApiStorage';
import { toast } from 'sonner';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Pencil, Trash2} from 'lucide-react';

export function CompaniesManager() {
  const { companies, createCompany, updateCompany, deleteCompany } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    email: '',
    telefone: '',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      email: '',
      telefone: '',
    });
    setEditingCompany(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingCompany) {
        console.log('📝 Editando empresa:', editingCompany.id);
        await updateCompany(editingCompany.id, formData);
      } else {
        console.log('➕ Criando nova empresa com dados:', formData);
        const created = await createCompany(formData);
        console.log('✅ Empresa criada e retornada:', created);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ Erro no handleSubmit:', error);
      // Error is already handled in useApiStorage with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      nome: company.nome,
      cnpj: company.cnpj || '',
      endereco: company.endereco || '',
      email: company.email || '',
      telefone: company.telefone || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await deleteCompany(id);
        toast.success('Empresa excluída com sucesso!');
      } catch (error) {
        // Error is already handled in useApiStorage with toast
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cadastro de Empresas</CardTitle>
            <CardDescription>Gerencie as empresas clientes do laboratório</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : editingCompany ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhuma empresa cadastrada. Clique em "Nova Empresa" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.nome}</TableCell>
                  <TableCell>{company.cnpj || '-'}</TableCell>
                  <TableCell>{company.endereco || '-'}</TableCell>
                  <TableCell>{company.email || '-'}</TableCell>
                  <TableCell>{company.telefone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}