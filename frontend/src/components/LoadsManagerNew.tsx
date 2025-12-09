import { useState } from "react";
import type { Load, Sample, LoadFormData } from "../types";
import { toast } from "sonner";
import { addDaysToDate, getNextPlanilhaNumber } from "../types";
import { formatDateBR } from "../utils/DateHelpers";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Plus,
  Truck,
  Package,
  FolderOpen,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Box,
} from "lucide-react";

interface GroupedPlanilha {
  obra_id: number;
  numero_planilha: number;
  obra_nome: string;
  cargas: Load[];
  total_amostras: number;
}

interface GroupedObra {
  obra_id: number;
  obra_nome: string;
  empresa_nome: string;
  planilhas: GroupedPlanilha[];
  total_cargas: number;
  total_amostras: number;
}

export function LoadsManagerNew() {
  const {
    companies,
    works,
    loads,
    samples,
    createLoad,
    updateLoad,
    deleteLoad,
    createSamplesBulk,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [viewingLoad, setViewingLoad] = useState<Load | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");

  const [formData, setFormData] = useState({
    quantity: "1",
    samples7d: "0",
    samples14d: "0",
    samples28d: "2",
    samples63d: "0",
    loads: [
      {
        caminhao: "",
        nota_fiscal: "",
        fck_mpa: "",
        slump_cm: "",
        data_moldagem: "",
        volume_m3: "",
        pavimento: "",
        peca: "",
        fornecedor_concreto: "",
        observacoes: "",
      },
    ] as Array<{
      caminhao: string;
      nota_fiscal: string;
      fck_mpa: string;
      slump_cm: string;
      data_moldagem: string;
      volume_m3: string;
      pavimento: string;
      peca: string;
      fornecedor_concreto: string;
      observacoes: string;
    }>,
  });

  const resetForm = () => {
    setFormData({
      quantity: "1",
      samples7d: "0",
      samples14d: "0",
      samples28d: "2",
      samples63d: "0",
      loads: [
        {
          caminhao: "",
          nota_fiscal: "",
          fck_mpa: "",
          slump_cm: "",
          data_moldagem: "",
          volume_m3: "",
          pavimento: "",
          peca: "",
          fornecedor_concreto: "",
          observacoes: "",
        },
      ],
    });
    setEditingLoad(null);
    setSelectedWorkId("");
  };

  const calculateTestDate = (moldingDate: string, age: number): string => {
    return addDaysToDate(moldingDate, age);
  };

  const generateSamples = async (
    loadId: number,
    moldingDate: string,
    samplesConfig: { age: number; quantity: number }[]
  ) => {
    const newSamples: Omit<
      Sample,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >[] = [];

    let sequencia = 1;
    let nextLabNumber =
      Math.max(0, ...samples.map((s) => s.numero_laboratorio)) + 1;

    samplesConfig.forEach((config) => {
      for (let i = 1; i <= config.quantity; i++) {
        newSamples.push({
          carga_id: loadId,
          sequencia: sequencia++,
          numero_laboratorio: nextLabNumber++,
          idade_dias: config.age,
          data_prevista_rompimento: calculateTestDate(moldingDate, config.age),
          data_rompimento: undefined,
          diametro_mm: 100,
          altura_mm: 200,
          carga_kn: undefined,
          resistencia_mpa: undefined,
          status: "pending",
        });
      }
    });

    await createSamplesBulk(newSamples);
  };

  const getSamplesConfig = () => {
    const config: { age: number; quantity: number }[] = [];

    const qty7 = parseInt(formData.samples7d) || 0;
    const qty14 = parseInt(formData.samples14d) || 0;
    const qty28 = parseInt(formData.samples28d) || 0;
    const qty63 = parseInt(formData.samples63d) || 0;

    if (qty7 > 0) config.push({ age: 7, quantity: qty7 });
    if (qty14 > 0) config.push({ age: 14, quantity: qty14 });
    if (qty28 > 0) config.push({ age: 28, quantity: qty28 });
    if (qty63 > 0) config.push({ age: 63, quantity: qty63 });

    return config;
  };

  const getTotalSamples = () => {
    return (
      (parseInt(formData.samples7d) || 0) +
      (parseInt(formData.samples14d) || 0) +
      (parseInt(formData.samples28d) || 0) +
      (parseInt(formData.samples63d) || 0)
    );
  };

  const handleQuantityChange = (quantity: string) => {
    const num = parseInt(quantity) || 1;
    const currentLoads = formData.loads;

    if (num > currentLoads.length) {
      const newLoads = [...currentLoads];
      for (let i = currentLoads.length; i < num; i++) {
        newLoads.push({
          caminhao: "",
          nota_fiscal: "",
          fck_mpa: "",
          slump_cm: "",
          data_moldagem: "",
          volume_m3: "",
          pavimento: "",
          peca: "",
          fornecedor_concreto: "",
          observacoes: "",
        });
      }
      setFormData({ ...formData, quantity, loads: newLoads });
    } else {
      setFormData({
        ...formData,
        quantity,
        loads: currentLoads.slice(0, num),
      });
    }
  };

  const updateLoadData = (index: number, field: string, value: string) => {
    const newLoads = [...formData.loads];
    newLoads[index] = { ...newLoads[index], [field]: value };
    setFormData({ ...formData, loads: newLoads });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedWorkId || selectedWorkId === "") {
      toast.error("Selecione uma obra antes de cadastrar planilhas");
      setIsSubmitting(false);
      return;
    }

    const obraExists = works.some((work) => work.id === Number(selectedWorkId));
    if (!obraExists) {
      toast.error("A obra selecionada não existe. Cadastre uma obra primeiro.");
      setIsSubmitting(false);
      return;
    }

    const samplesConfig = getSamplesConfig();

    if (samplesConfig.length === 0) {
      toast.error("Defina pelo menos uma amostra para moldar");
      setIsSubmitting(false);
      return;
    }

    try {
      const numeroPlanilha = getNextPlanilhaNumber(
        loads,
        Number(selectedWorkId)
      );

      const promises = formData.loads.map(async (loadData) => {
        if (!loadData.data_moldagem) {
          throw new Error("Data de moldagem é obrigatória");
        }

        const loadPayload: LoadFormData = {
          obra_id: Number(selectedWorkId),
          numero_planilha: numeroPlanilha,
          data_moldagem: loadData.data_moldagem,
          caminhao: loadData.caminhao || undefined,
          nota_fiscal: loadData.nota_fiscal || undefined,
          volume_m3: loadData.volume_m3
            ? Number(loadData.volume_m3)
            : undefined,
          slump_cm: loadData.slump_cm || undefined,
          fck_mpa: loadData.fck_mpa ? Number(loadData.fck_mpa) : undefined,
          pavimento: loadData.pavimento || undefined,
          peca: loadData.peca || undefined,
          fornecedor_concreto: loadData.fornecedor_concreto || undefined,
          observacoes: loadData.observacoes || undefined,
        };

        const newLoad = await createLoad(loadPayload);
        await generateSamples(
          newLoad.id,
          loadData.data_moldagem,
          samplesConfig
        );

        return newLoad;
      });

      await Promise.all(promises);

      setIsDialogOpen(false);
      resetForm();

      const obra = works.find((w) => w.id === Number(selectedWorkId));
      toast.success(
        `Planilha #${numeroPlanilha} criada com ${formData.loads.length} carga(s) para ${obra?.nome}!`
      );
    } catch (error: unknown) {
      console.error("Erro ao cadastrar planilhas:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Verifique os dados e tente novamente";
      toast.error(`Erro ao cadastrar: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (load: Load) => {
    setEditingLoad(load);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (load: Load) => {
    setViewingLoad(load);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoad) return;

    setIsSubmitting(true);
    try {
      await updateLoad(editingLoad.id, editingLoad);
      setIsEditDialogOpen(false);
      setEditingLoad(null);
      toast.success("Carga atualizada com sucesso!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar carga: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (loadId: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta carga? Todas as amostras relacionadas serão excluídas."
      )
    ) {
      try {
        await deleteLoad(loadId);
        toast.success("Carga excluída com sucesso!");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao excluir carga: ${errorMessage}`);
      }
    }
  };

  const groupedData = () => {
    const grouped: { [key: string]: GroupedObra } = {};

    loads.forEach((load) => {
      const obra = works.find((w) => w.id === load.obra_id);
      if (!obra) return;

      const empresa = companies.find((c) => c.id === obra.empresa_id);
      const obraKey = `obra_${load.obra_id}`;

      if (!grouped[obraKey]) {
        grouped[obraKey] = {
          obra_id: load.obra_id,
          obra_nome: obra.nome,
          empresa_nome: empresa?.nome || "Sem empresa",
          planilhas: [],
          total_cargas: 0,
          total_amostras: 0,
        };
      }

      let planilha = grouped[obraKey].planilhas.find(
        (p) =>
          p.obra_id === load.obra_id &&
          p.numero_planilha === load.numero_planilha
      );

      if (!planilha) {
        planilha = {
          obra_id: load.obra_id,
          numero_planilha: load.numero_planilha,
          obra_nome: obra.nome,
          cargas: [],
          total_amostras: 0,
        };
        grouped[obraKey].planilhas.push(planilha);
      }

      planilha.cargas.push(load);
      const loadSamples = samples.filter((s) => s.carga_id === load.id);
      planilha.total_amostras += loadSamples.length;

      grouped[obraKey].total_cargas += 1;
      grouped[obraKey].total_amostras += loadSamples.length;
    });

    return Object.values(grouped);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Gerenciar Planilhas e Cargas</h2>
          <p className="text-muted-foreground">
            Cadastre planilhas de concreto com múltiplas cargas e amostras
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Planilha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Planilha de Concreto</DialogTitle>
              <DialogDescription>
                Configure as cargas e amostras para a planilha
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="work">Obra *</Label>
                <Select
                  value={selectedWorkId}
                  onValueChange={setSelectedWorkId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {works.map((work) => {
                      const company = companies.find(
                        (c) => c.id === work.empresa_id
                      );
                      return (
                        <SelectItem key={work.id} value={work.id.toString()}>
                          {work.nome} {company ? `- ${company.nome}` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">Configuração de Amostras</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="samples7d">7 dias</Label>
                    <Input
                      id="samples7d"
                      type="number"
                      min="0"
                      value={formData.samples7d}
                      onChange={(e) =>
                        setFormData({ ...formData, samples7d: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="samples14d">14 dias</Label>
                    <Input
                      id="samples14d"
                      type="number"
                      min="0"
                      value={formData.samples14d}
                      onChange={(e) =>
                        setFormData({ ...formData, samples14d: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="samples28d">28 dias</Label>
                    <Input
                      id="samples28d"
                      type="number"
                      min="0"
                      value={formData.samples28d}
                      onChange={(e) =>
                        setFormData({ ...formData, samples28d: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="samples63d">63 dias</Label>
                    <Input
                      id="samples63d"
                      type="number"
                      min="0"
                      value={formData.samples63d}
                      onChange={(e) =>
                        setFormData({ ...formData, samples63d: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de amostras por carga: {getTotalSamples()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade de Cargas</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Dados das Cargas</h3>
                <Accordion type="multiple" className="space-y-2">
                  {formData.loads.map((load, index) => (
                    <AccordionItem
                      key={index}
                      value={`load-${index}`}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>Carga {index + 1}</span>
                          {load.nota_fiscal && (
                            <Badge variant="outline">{load.nota_fiscal}</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Caminhão</Label>
                            <Input
                              value={load.caminhao}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "caminhao",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: CAM-01"
                            />
                          </div>
                          <div>
                            <Label>Nota Fiscal</Label>
                            <Input
                              value={load.nota_fiscal}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "nota_fiscal",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: NF-12345"
                            />
                          </div>
                          <div>
                            <Label>Data de Moldagem *</Label>
                            <Input
                              type="date"
                              value={load.data_moldagem}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "data_moldagem",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>FCK (MPa)</Label>
                            <Input
                              type="number"
                              value={load.fck_mpa}
                              onChange={(e) =>
                                updateLoadData(index, "fck_mpa", e.target.value)
                              }
                              placeholder="Ex: 30"
                            />
                          </div>
                          <div>
                            <Label>Slump (cm)</Label>
                            <Input
                              value={load.slump_cm}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "slump_cm",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: 100±20"
                            />
                          </div>
                          <div>
                            <Label>Volume (m³)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={load.volume_m3}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "volume_m3",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: 8.50"
                            />
                          </div>
                          <div>
                            <Label>Pavimento</Label>
                            <Input
                              value={load.pavimento}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "pavimento",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Térreo"
                            />
                          </div>
                          <div>
                            <Label>Peça</Label>
                            <Input
                              value={load.peca}
                              onChange={(e) =>
                                updateLoadData(index, "peca", e.target.value)
                              }
                              placeholder="Ex: Pilares P1-P10"
                            />
                          </div>
                          <div>
                            <Label>Fornecedor de Concreto</Label>
                            <Input
                              value={load.fornecedor_concreto}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "fornecedor_concreto",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Concreteira Sul"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Observações</Label>
                            <Input
                              value={load.observacoes}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "observacoes",
                                  e.target.value
                                )
                              }
                              placeholder="Observações sobre a carga"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Planilha"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Carga</DialogTitle>
            <DialogDescription>
              Atualize as informações da carga
            </DialogDescription>
          </DialogHeader>

          {editingLoad && (
            <form onSubmit={handleUpdateLoad} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Caminhão</Label>
                  <Input
                    value={editingLoad.caminhao || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        caminhao: e.target.value,
                      })
                    }
                    placeholder="Ex: CAM-01"
                  />
                </div>
                <div>
                  <Label>Nota Fiscal</Label>
                  <Input
                    value={editingLoad.nota_fiscal || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        nota_fiscal: e.target.value,
                      })
                    }
                    placeholder="Ex: NF-12345"
                  />
                </div>
                <div>
                  <Label>Data de Moldagem *</Label>
                  <Input
                    type="date"
                    value={editingLoad.data_moldagem}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        data_moldagem: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>FCK (MPa)</Label>
                  <Input
                    type="number"
                    value={editingLoad.fck_mpa || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        fck_mpa: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Ex: 30"
                  />
                </div>
                <div>
                  <Label>Slump (cm)</Label>
                  <Input
                    value={editingLoad.slump_cm || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        slump_cm: e.target.value,
                      })
                    }
                    placeholder="Ex: 100±20"
                  />
                </div>
                <div>
                  <Label>Volume (m³)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingLoad.volume_m3 || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        volume_m3: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Ex: 8.50"
                  />
                </div>
                <div>
                  <Label>Pavimento</Label>
                  <Input
                    value={editingLoad.pavimento || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        pavimento: e.target.value,
                      })
                    }
                    placeholder="Ex: Térreo"
                  />
                </div>
                <div>
                  <Label>Peça</Label>
                  <Input
                    value={editingLoad.peca || ""}
                    onChange={(e) =>
                      setEditingLoad({ ...editingLoad, peca: e.target.value })
                    }
                    placeholder="Ex: Pilares P1-P10"
                  />
                </div>
                <div>
                  <Label>Fornecedor de Concreto</Label>
                  <Input
                    value={editingLoad.fornecedor_concreto || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        fornecedor_concreto: e.target.value,
                      })
                    }
                    placeholder="Ex: Concreteira Sul"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Input
                    value={editingLoad.observacoes || ""}
                    onChange={(e) =>
                      setEditingLoad({
                        ...editingLoad,
                        observacoes: e.target.value,
                      })
                    }
                    placeholder="Observações sobre a carga"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingLoad(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Atualizando..." : "Atualizar Carga"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalhes da Carga
            </DialogTitle>
          </DialogHeader>

          {viewingLoad &&
            (() => {
              const obra = works.find((w) => w.id === viewingLoad.obra_id);
              const empresa = obra
                ? companies.find((c) => c.id === obra.empresa_id)
                : null;
              const loadSamples = samples.filter(
                (s) => s.carga_id === viewingLoad.id
              );

              return (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Informações da Obra
                    </h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Obra</p>
                        <p className="font-medium">{obra?.nome || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Empresa</p>
                        <p className="font-medium">{empresa?.nome || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Planilha
                        </p>
                        <p className="font-medium">
                          #{viewingLoad.numero_planilha}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Dados da Carga
                    </h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Caminhão
                        </p>
                        <p className="font-medium">
                          {viewingLoad.caminhao || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Nota Fiscal
                        </p>
                        <p className="font-medium">
                          {viewingLoad.nota_fiscal || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Data de Moldagem
                        </p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateBR(viewingLoad.data_moldagem)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">FCK</p>
                        <p className="font-medium">
                          {viewingLoad.fck_mpa
                            ? `${viewingLoad.fck_mpa} MPa`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Slump</p>
                        <p className="font-medium">
                          {viewingLoad.slump_cm || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volume</p>
                        <p className="font-medium">
                          {viewingLoad.volume_m3
                            ? `${viewingLoad.volume_m3} m³`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pavimento
                        </p>
                        <p className="font-medium">
                          {viewingLoad.pavimento || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peça</p>
                        <p className="font-medium">{viewingLoad.peca || "-"}</p>
                      </div>
                      {viewingLoad.fornecedor_concreto && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Fornecedor de Concreto
                          </p>
                          <p className="font-medium">
                            {viewingLoad.fornecedor_concreto}
                          </p>
                        </div>
                      )}
                      {viewingLoad.observacoes && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Observações
                          </p>
                          <p className="font-medium">
                            {viewingLoad.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Box className="h-4 w-4" />
                      Amostras ({loadSamples.length})
                    </h3>
                    <div className="space-y-2">
                      {loadSamples.length > 0 ? (
                        <div className="grid gap-2">
                          {loadSamples.map((sample) => (
                            <div
                              key={sample.id}
                              className="p-3 border rounded-lg bg-background"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">
                                    #{sample.numero_laboratorio}
                                  </Badge>
                                  <span className="text-sm">
                                    Idade: {sample.idade_dias} dias
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Previsto:{" "}
                                    {formatDateBR(
                                      sample.data_prevista_rompimento
                                    )}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    sample.status === "tested"
                                      ? "default"
                                      : sample.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {sample.status === "tested"
                                    ? "Testado"
                                    : sample.status === "pending"
                                    ? "Pendente"
                                    : "Reprovado"}
                                </Badge>
                              </div>
                              {sample.resistencia_mpa && (
                                <div className="mt-2 text-sm">
                                  <span className="text-muted-foreground">
                                    Resistência:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {Number(sample.resistencia_mpa).toFixed(2)}{" "}
                                    MPa
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                          Nenhuma amostra registrada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {groupedData().map((obra) => (
          <Card key={obra.obra_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    {obra.obra_nome}
                  </CardTitle>
                  <CardDescription>{obra.empresa_nome}</CardDescription>
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge variant="secondary">
                    {obra.total_cargas}{" "}
                    {obra.total_cargas === 1 ? "carga" : "cargas"}
                  </Badge>
                  <Badge variant="outline">
                    {obra.total_amostras}{" "}
                    {obra.total_amostras === 1 ? "amostra" : "amostras"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {obra.planilhas.map((planilha) => (
                  <AccordionItem
                    key={`${planilha.obra_id}-${planilha.numero_planilha}`}
                    value={`planilha-${planilha.obra_id}-${planilha.numero_planilha}`}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Planilha #{planilha.numero_planilha}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {planilha.cargas.length}{" "}
                            {planilha.cargas.length === 1 ? "carga" : "cargas"}
                          </Badge>
                          <Badge variant="outline">
                            {planilha.total_amostras}{" "}
                            {planilha.total_amostras === 1
                              ? "amostra"
                              : "amostras"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {planilha.cargas.map((load) => {
                          const loadSamples = samples.filter(
                            (s) => s.carga_id === load.id
                          );
                          return (
                            <div
                              key={load.id}
                              className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  {load.nota_fiscal && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      NF: {load.nota_fiscal}
                                    </Badge>
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {formatDateBR(load.data_moldagem)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <div>FCK: {load.fck_mpa || "-"} MPa</div>
                                  <div>Volume: {load.volume_m3 || "-"} m³</div>
                                  <div>
                                    {loadSamples.length}{" "}
                                    {loadSamples.length === 1
                                      ? "amostra"
                                      : "amostras"}
                                  </div>
                                </div>
                                {load.fornecedor_concreto && (
                                  <div className="text-xs text-muted-foreground">
                                    Fornecedor: {load.fornecedor_concreto}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(load)}
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(load)}
                                  title="Editar carga"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(load.id)}
                                  title="Excluir carga"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {loads.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma planilha cadastrada. Clique em "Nova Planilha" para
                começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default LoadsManagerNew;
