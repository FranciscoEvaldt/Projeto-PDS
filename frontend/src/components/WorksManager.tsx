import { useState } from "react";
import { toast } from "sonner";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  FolderOpen,
  MapPin,
  Calendar,
  FileText,
  User,
  Activity,
} from "lucide-react";
import { Work } from "../hooks/useApiStorage";

export function WorksManager() {
  const { companies, works, createWork, updateWork, deleteWork } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    empresa_id: null as number | null,
    codigo: "",
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    fck_projeto: "",
    responsavel_obra: "",
    contrato: "",
    data_inicio: "",
    status: "active",
  });

  const resetForm = () => {
    setFormData({
      empresa_id: null,
      codigo: "",
      nome: "",
      endereco: "",
      cidade: "",
      estado: "",
      fck_projeto: "",
      responsavel_obra: "",
      contrato: "",
      data_inicio: "",
      status: "active",
    });
    setEditingWork(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.empresa_id) {
        toast.error("Por favor, selecione uma empresa");
        setIsSubmitting(false);
        return;
      }

      const dataToSubmit = {
        empresa_id: formData.empresa_id,
        codigo: formData.codigo || undefined,
        nome: formData.nome,
        endereco: formData.endereco || undefined,
        cidade: formData.cidade || undefined,
        estado: formData.estado || undefined,
        fck_projeto: formData.fck_projeto
          ? parseFloat(formData.fck_projeto)
          : undefined,
        responsavel_obra: formData.responsavel_obra || undefined,
        contrato: formData.contrato || undefined,
        data_inicio: formData.data_inicio || undefined,
        status: formData.status || undefined,
      };

      if (editingWork) {
        await updateWork(editingWork.id, dataToSubmit);
        toast.success("Obra atualizada com sucesso!");
      } else {
        await createWork(dataToSubmit);
        toast.success("Obra cadastrada com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      empresa_id: work.empresa_id ?? null,
      codigo: work.codigo || "",
      nome: work.nome,
      endereco: work.endereco || "",
      cidade: work.cidade || "",
      estado: work.estado || "",
      fck_projeto: work.fck_projeto?.toString() || "",
      responsavel_obra: work.responsavel_obra || "",
      contrato: work.contrato || "",
      data_inicio: work.data_inicio || "",
      status: work.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta obra?")) {
      try {
        await deleteWork(id);
        toast.success("Obra excluída com sucesso!");
      } catch (error) {}
    }
  };

  const worksByCompany = companies
    .map((company) => ({
      company,
      works: works.filter((work) => work.empresa_id === company.id),
    }))
    .filter((group) => group.works.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cadastro de Obras</CardTitle>
            <CardDescription>
              Gerencie as obras vinculadas às empresas
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
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWork ? "Editar Obra" : "Nova Obra"}
                </DialogTitle>
                <DialogDescription>Preencha os dados da obra</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  {companies.length === 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Nenhuma empresa cadastrada!</strong>
                        <br />
                        Por favor, cadastre uma empresa primeiro na aba{" "}
                        <strong>&quot;Empresas&quot;</strong> antes de criar uma
                        obra.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-700">
                        Informações Básicas
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="empresa_id"
                          className="flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-gray-500" />
                          Empresa *
                        </Label>
                        <Select
                          value={formData.empresa_id?.toString() || ""}
                          onValueChange={(value: string) =>
                            setFormData({
                              ...formData,
                              empresa_id: value ? parseInt(value, 10) : null,
                            })
                          }
                          required
                          disabled={companies.length === 0}
                        >
                          <SelectTrigger
                            className={
                              companies.length === 0 ? "bg-gray-100" : ""
                            }
                          >
                            <SelectValue
                              placeholder={
                                companies.length === 0
                                  ? "Nenhuma empresa cadastrada"
                                  : "Selecione uma empresa"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.length === 0 ? (
                              <div className="p-3 text-center text-sm text-gray-500">
                                Cadastre uma empresa primeiro
                              </div>
                            ) : (
                              companies.map((company) => (
                                <SelectItem
                                  key={company.id}
                                  value={company.id.toString()}
                                >
                                  {company.nome}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="codigo"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                            Código *
                          </Label>
                          <Input
                            id="codigo"
                            value={formData.codigo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                codigo: e.target.value,
                              })
                            }
                            placeholder="OB-001"
                            className="font-mono"
                            required
                          />
                        </div>
                        <div className="grid gap-2 col-span-3">
                          <Label
                            htmlFor="nome"
                            className="flex items-center gap-2"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                            Nome da Obra *
                          </Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) =>
                              setFormData({ ...formData, nome: e.target.value })
                            }
                            placeholder="Ex: Edifício Residencial Solar"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-700">
                        Localização
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="endereco"
                          className="flex items-center gap-2"
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          Endereço
                        </Label>
                        <Input
                          id="endereco"
                          value={formData.endereco}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: e.target.value,
                            })
                          }
                          placeholder="Rua, número, bairro"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="grid gap-2 col-span-3">
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            value={formData.cidade}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cidade: e.target.value,
                              })
                            }
                            placeholder="Ex: São Paulo"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="estado">UF</Label>
                          <Input
                            id="estado"
                            value={formData.estado}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                estado: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="SP"
                            maxLength={2}
                            className="uppercase text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-700">
                        Detalhes Técnicos e Administrativos
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="fck_projeto"
                            className="flex items-center gap-2"
                          >
                            <Activity className="w-3.5 h-3.5 text-gray-500" />
                            FCK do Projeto
                          </Label>
                          <div className="relative">
                            <Input
                              id="fck_projeto"
                              type="number"
                              step="0.1"
                              value={formData.fck_projeto}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fck_projeto: e.target.value,
                                })
                              }
                              placeholder="25.0"
                              className="pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              MPa
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label
                            htmlFor="responsavel_obra"
                            className="flex items-center gap-2"
                          >
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            Responsável
                          </Label>
                          <Input
                            id="responsavel_obra"
                            value={formData.responsavel_obra}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                responsavel_obra: e.target.value,
                              })
                            }
                            placeholder="Nome do responsável"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label
                            htmlFor="contrato"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                            Nº Contrato
                          </Label>
                          <Input
                            id="contrato"
                            value={formData.contrato}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                contrato: e.target.value,
                              })
                            }
                            placeholder="CT-2024-001"
                            className="font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="data_inicio"
                            className="flex items-center gap-2"
                          >
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            Data de Início
                          </Label>
                          <Input
                            id="data_inicio"
                            type="date"
                            value={formData.data_inicio}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                data_inicio: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label
                            htmlFor="status"
                            className="flex items-center gap-2"
                          >
                            <Activity className="w-3.5 h-3.5 text-gray-500" />
                            Status
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: string) =>
                              setFormData({ ...formData, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  Ativa
                                </span>
                              </SelectItem>
                              <SelectItem value="inactive">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                  Inativa
                                </span>
                              </SelectItem>
                              <SelectItem value="completed">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  Concluída
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || companies.length === 0}
                  >
                    {isSubmitting
                      ? "Salvando..."
                      : editingWork
                      ? "Atualizar Obra"
                      : "Cadastrar Obra"}
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
            Nenhuma obra cadastrada. Clique em &quot;Nova Obra&quot; para
            começar.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {worksByCompany.map(({ company, works: companyWorks }) => (
              <AccordionItem key={company.id} value={company.id.toString()}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{company.nome}</span>
                    <Badge variant="secondary" className="ml-2">
                      {companyWorks.length}{" "}
                      {companyWorks.length === 1 ? "obra" : "obras"}
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
                          <TableHead>Cidade/UF</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyWorks.map((work) => {
                          return (
                            <TableRow key={work.id}>
                              <TableCell>
                                <span className="font-mono text-sm font-semibold text-blue-600">
                                  {work.codigo || "-"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="w-4 h-4 text-amber-600" />
                                  <span>{work.nome}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {[work.cidade, work.estado]
                                  .filter(Boolean)
                                  .join(" / ") || "-"}
                              </TableCell>
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
