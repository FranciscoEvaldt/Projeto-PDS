import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useStorage, type Work } from '../hooks/useStorage';
import { toast } from 'sonner';

export function WorksManager() {
  const { companies, works, saveWorks } = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    address: '',
    responsible: '',
    supplier: '',
    status: 'active' as 'active' | 'completed' | 'paused',
  });

  const resetForm = () => {
    setFormData({
      companyId: '',
      name: '',
      address: '',
      responsible: '',
      supplier: '',
      status: 'active',
    });
    setEditingWork(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWork) {
      const updatedWorks = works.map(w =>
        w.id === editingWork.id
          ? { ...w, ...formData }
          : w
      );
      saveWorks(updatedWorks);
      toast.success('Obra atualizada com sucesso!');
    } else {
      const newWork: Work = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      saveWorks([...works, newWork]);
      toast.success('Obra cadastrada com sucesso!');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      companyId: work.companyId,
      name: work.name,
      address: work.address,
      responsible: work.responsible,
      supplier: work.supplier,
      status: work.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
      saveWorks(works.filter(w => w.id !== id));
      toast.success('Obra excluída com sucesso!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativa', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'secondary' as const },
      paused: { label: 'Pausada', variant: 'outline' as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cadastro de Obras</CardTitle>
            <CardDescription>Gerencie as obras vinculadas às empresas</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingWork ? 'Editar Obra' : 'Nova Obra'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da obra
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyId">Empresa</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value: string) => setFormData({ ...formData, companyId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Obra</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e:React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e:React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">Fornecedor de Concreto</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e:React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nome da concreteira"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="responsible">Responsável</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible}
                        onChange={(e:React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, responsible: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'completed' | 'paused') =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="paused">Pausada</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingWork ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {works.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhuma obra cadastrada. Clique em "Nova Obra" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => {
                const company = companies.find(c => c.id === work.companyId);
                return (
                  <TableRow key={work.id}>
                    <TableCell>{work.name}</TableCell>
                    <TableCell>{company?.name || 'N/A'}</TableCell>
                    <TableCell>{work.address}</TableCell>
                    <TableCell>{work.supplier}</TableCell>
                    <TableCell>{work.responsible}</TableCell>
                    <TableCell>{getStatusBadge(work.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(work)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(work.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
