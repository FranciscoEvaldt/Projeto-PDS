import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Plus, Pencil, Trash2, Building2, FolderOpen } from 'lucide-react';
import type { Work } from '../types';
import { toast } from 'sonner';
import { useData } from '../contexts/useData';

export function WorksManager() {
  const { companies, works, addWork, updateWork, deleteWork } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    empresa_id: null as number | null,
    codigo: '',
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    fck_projeto: '',
    responsavel_obra: '',
    contrato: '',
    data_inicio: '',
    status: 'active' as 'active' | 'completed' | 'paused',
  });

  const resetForm = () => {
    setFormData({
      empresa_id: null,
      codigo: '',
      nome: '',
      endereco: '',
      cidade: '',
      estado: '',
      fck_projeto: '',
      responsavel_obra: '',
      contrato: '',
      data_inicio: '',
      status: 'active',
    });
    setEditingWork(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        fck_projeto: formData.fck_projeto ? parseFloat(formData.fck_projeto) : null,
        data_inicio: formData.data_inicio || null,
      };

      if (editingWork) {
        await updateWork(editingWork.id, dataToSubmit);
        toast.success('Obra atualizada com sucesso!');
      } else {
        await addWork(dataToSubmit);
        toast.success('Obra cadastrada com sucesso!');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch {
      // Error is already handled in useApiStorage with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      empresa_id: work.empresa_id,
      codigo: work.codigo || '',
      nome: work.nome,
      endereco: work.endereco || '',
      cidade: work.cidade || '',
      estado: work.estado || '',
      fck_projeto: work.fck_projeto ? work.fck_projeto.toString() : '',
      responsavel_obra: work.responsavel_obra || '',
      contrato: work.contrato || '',
      data_inicio: work.data_inicio || '',
      status: work.status as 'active' | 'completed' | 'paused',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
      try {
        await deleteWork(id);
        toast.success('Obra excluída com sucesso!');
      } catch {
        // Error is already handled in useApiStorage with toast
      }
    }
  };

  // Agrupar obras por empresa
  const worksByCompany = companies.map(company => ({
    company,
    works: works.filter(work => work.empresa_id === company.id)
  })).filter(group => group.works.length > 0);

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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    <Label htmlFor="empresa_id">Empresa</Label>
                    <Select
                      value={formData.empresa_id?.toString() || ''}
                      onValueChange={(value: string) => setFormData({ ...formData, empresa_id: parseInt(value) })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="codigo">Código da Obra *</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="Ex: OB-001"
                        required
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="nome">Nome da Obra *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fck_projeto">Fck Projeto (MPa)</Label>
                      <Input
                        id="fck_projeto"
                        type="number"
                        step="0.01"
                        value={formData.fck_projeto}
                        onChange={(e) => setFormData({ ...formData, fck_projeto: e.target.value })}
                        placeholder="Ex: 25.0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contrato">Contrato</Label>
                      <Input
                        id="contrato"
                        value={formData.contrato}
                        onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="responsavel_obra">Responsável pela Obra</Label>
                    <Input
                      id="responsavel_obra"
                      value={formData.responsavel_obra}
                      onChange={(e) => setFormData({ ...formData, responsavel_obra: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="data_inicio">Data de Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status da Obra *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'completed' | 'paused') => 
                          setFormData({ ...formData, status: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">🟢 Ativa</SelectItem>
                          <SelectItem value="paused">🟡 Pausada</SelectItem>
                          <SelectItem value="completed">🔵 Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
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
          <Accordion type="multiple" className="w-full">
            {worksByCompany.map(({ company, works: companyWorks }) => (
              <AccordionItem key={company.id} value={company.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{company.nome}</span>
                    <Badge variant="secondary" className="ml-2">
                      {companyWorks.length} {companyWorks.length === 1 ? 'obra' : 'obras'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 pl-8">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Obra</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Cidade/UF</TableHead>
                          <TableHead>Fck Projeto</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyWorks.map((work) => {
                          const statusConfig = {
                            active: { label: 'Ativa', variant: 'default' as const, icon: '🟢' },
                            paused: { label: 'Pausada', variant: 'secondary' as const, icon: '🟡' },
                            completed: { label: 'Concluída', variant: 'outline' as const, icon: '🔵' },
                          };
                          const status = statusConfig[work.status as 'active' | 'paused' | 'completed'] || statusConfig.active;
                          
                          return (
                            <TableRow key={work.id}>
                              <TableCell>
                                <span className="font-mono text-sm font-semibold text-blue-600">
                                  {work.codigo || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="w-4 h-4 text-amber-600" />
                                  <span>{work.nome}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant}>
                                  {status.icon} {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {[work.cidade, work.estado].filter(Boolean).join(' / ') || '-'}
                              </TableCell>
                              <TableCell>
                                {work.fck_projeto ? `${work.fck_projeto} MPa` : '-'}
                              </TableCell>
                              <TableCell>{work.responsavel_obra || '-'}</TableCell>
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}