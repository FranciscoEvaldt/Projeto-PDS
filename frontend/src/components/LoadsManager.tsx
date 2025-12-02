import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Plus, Pencil, Trash2, Truck, FileText } from "lucide-react";
import { useData } from "../contexts/useData";
import { type Load, type Sample, getNextPlanilhaNumber } from "../types";
import { toast } from "sonner";
import { formatDateBR, addDaysToDate } from "../utils/DateHelpers";

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

export function LoadsManager() {
  const {
    companies,
    works,
    loads,
    samples,
    addLoad,
    updateLoad,
    deleteLoad,
    addSamples,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
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
        loadNumber: "",
        invoiceNumber: "",
        fck: "",
        slump: "",
        deliveryDate: "",
        volume: "",
        pavimento: "",
        peca: "",
      },
    ] as Array<{
      loadNumber: string;
      invoiceNumber: string;
      fck: string;
      slump: string;
      deliveryDate: string;
      volume: string;
      pavimento: string;
      peca: string;
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
          loadNumber: "",
          invoiceNumber: "",
          fck: "",
          slump: "",
          deliveryDate: "",
          volume: "",
          pavimento: "",
          peca: "",
        },
      ],
    });
    setEditingLoad(null);
  };

  const calculateTestDate = (moldingDate: string, age: number): string => {
    return addDaysToDate(moldingDate, age);
  };

  const generateSamples = async (
    loadId: number,
    loadNumber: string,
    moldingDate: string,
    samplesConfig: { age: number; quantity: number }[]
  ) => {
    const newSamples: Omit<Sample, "id">[] = [];

    let sequencia = 1;
    samplesConfig.forEach((config) => {
      for (let i = 1; i <= config.quantity; i++) {
        newSamples.push({
          carga_id: loadId,
          sequencia: sequencia++,
          idade_dias: config.age,
          data_prevista_rompimento: calculateTestDate(moldingDate, config.age),
          data_rompimento: null,
          diametro_mm: null,
          altura_mm: null,
          carga_kn: null,
          resistencia_mpa: null,
          status: "pendente",
          observacoes: 'Carga nº ${loadNumber}',
          numero_laboratorio: Number(loadNumber),
          data_moldagem: ""
        });
      }
    });

    await addSamples(newSamples);
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
          loadNumber: "",
          invoiceNumber: "",
          fck: "",
          slump: "",
          deliveryDate: "",
          volume: "",
          pavimento: "",
          peca: "",
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
      toast.error(
        'A obra selecionada não existe. Cadastre uma obra primeiro na aba "Obras".'
      );
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
      // Calcular o próximo número de planilha para esta obra (será o mesmo para todas as cargas)
      const numeroPlanilha = getNextPlanilhaNumber(
        loads,
        Number(selectedWorkId)
      );

      const promises = formData.loads.map(async (loadData) => {
        const loadPayload = {
          obra_id: Number(selectedWorkId),
          invoice_number: numeroPlanilha,
          caminhao: loadData.invoiceNumber,
          nota_fiscal: loadData.invoiceNumber,
          molding_date: loadData.deliveryDate,
          fck_mpa: Number(loadData.fck),
          slump_cm: Number(loadData.slump),
          volume_m3: Number(loadData.volume),
          pavimento: loadData.pavimento || null,
          peca: loadData.peca || null,
          observacoes: null,
          concrete_type: null,
        };

        const newLoad = await addLoad(loadPayload);
        await generateSamples(
          newLoad.id,
          loadData.loadNumber,
          loadData.deliveryDate,
          samplesConfig
        );

        return newLoad;
      });

      await Promise.all(promises);

      setIsDialogOpen(false);
      resetForm();

      const obra = works.find((w) => w.id === Number(selectedWorkId));
      toast.success(
        `Planilha #${numeroPlanilha} criada com ${formData.loads.length} carga(s) para ${obra?.name}!`
      );
    } catch (error: unknown) {
      console.error("Erro ao cadastrar planilhas:", error);

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (
          msg.includes("chave estrangeira") ||
          msg.includes("foreign key") ||
          msg.includes("carga_obra_id_fkey")
        ) {
          toast.error(
            '❌ Erro: A obra selecionada não existe no banco de dados. Cadastre a obra novamente na aba "Obras".'
          );
        } else {
          toast.error(`Erro ao cadastrar: ${error.message}`);
        }
      } else {
        // Caso seja algo inesperado (string, número, etc)
        toast.error(
          "Erro ao cadastrar planilhas. Verifique os dados e tente novamente."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (load: Load) => {
    setEditingLoad(load);
    setSelectedWorkId(load.obra_id.toString());

    setFormData({
      quantity: "1",
      samples7d: "0",
      samples14d: "0",
      samples28d: "0",
      samples63d: "0",
      loads: [
        {
          loadNumber: load.nota_fiscal || "",
          invoiceNumber: load.nota_fiscal || "",
          fck: load.fck_mpa?.toString() || "",
          slump: load.slump_cm?.toString() || "",
          deliveryDate: load.molding_date,
          volume: load.volume_m3?.toString() || "",
          pavimento: load.pavimento || "",
          peca: load.peca || "",
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const handleUpdateLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const samplesConfig = getSamplesConfig();

    if (samplesConfig.length === 0) {
      toast.error("Defina pelo menos uma amostra para moldar");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingLoad) {
        const loadData = formData.loads[0];

        let numeroPlanilha = editingLoad.invoice_number;
        if (Number(selectedWorkId) !== editingLoad.obra_id) {
          numeroPlanilha = getNextPlanilhaNumber(loads, Number(selectedWorkId));
        }

        await updateLoad(editingLoad.id, {
          obra_id: Number(selectedWorkId),
          invoice_number: numeroPlanilha,
          caminhao: loadData.invoiceNumber,
          nota_fiscal: loadData.invoiceNumber,
          molding_date: loadData.deliveryDate,
          fck_mpa: Number(loadData.fck),
          slump_cm: Number(loadData.slump),
          volume_m3: Number(loadData.volume),
          pavimento: loadData.pavimento || null,
          peca: loadData.peca || null,
        });
        toast.success("Carga atualizada com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch {
      // Error is already handled in useApiStorage with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta carga? As amostras relacionadas também serão excluídas."
      )
    ) {
      deleteLoad(id);
      toast.success("Carga excluída com sucesso!");
    }
  };

  // Agrupar cargas por obra e número de planilha
  const getGroupedPlanilhas = (): GroupedPlanilha[] => {
    const grouped: { [key: string]: GroupedPlanilha } = {};

    loads.forEach((load) => {
      const key = `${load.obra_id}-${load.invoice_number}`;

      if (!grouped[key]) {
        const work = works.find((w) => w.id === load.obra_id);
        grouped[key] = {
          obra_id: load.obra_id,
          numero_planilha: load.invoice_number || 0,
          obra_nome: work?.name || "N/A",
          cargas: [],
          total_amostras: 0,
        };
      }

      grouped[key].cargas.push(load);
    });

    // Calcular total de amostras para cada planilha
    Object.values(grouped).forEach((planilha) => {
      planilha.total_amostras = planilha.cargas.reduce((total, carga) => {
        return total + samples.filter((s) => s.carga_id === carga.id).length;
      }, 0);
    });

    // Ordenar por obra e depois por número de planilha
    return Object.values(grouped).sort((a, b) => {
      if (a.obra_id !== b.obra_id) {
        return a.obra_id - b.obra_id;
      }
      return a.numero_planilha - b.numero_planilha;
    });
  };

  const getGroupedObras = (): GroupedObra[] => {
    const grouped: { [key: number]: GroupedObra } = {};

    const planilhas = getGroupedPlanilhas();

    planilhas.forEach((planilha) => {
      const key = planilha.obra_id;

      if (!grouped[key]) {
        const work = works.find((w) => w.id === key);
        const company = companies.find((c) => c.id === work?.empresa_id);
        grouped[key] = {
          obra_id: key,
          obra_nome: work?.name || "N/A",
          empresa_nome: company?.name || "Sem empresa",
          planilhas: [],
          total_cargas: 0,
          total_amostras: 0,
        };
      }

      grouped[key].planilhas.push(planilha);
    });

    // Calcular total de cargas e amostras para cada obra
    Object.values(grouped).forEach((obra) => {
      obra.total_cargas = obra.planilhas.reduce((total, planilha) => {
        return total + planilha.cargas.length;
      }, 0);

      obra.total_amostras = obra.planilhas.reduce((total, planilha) => {
        return total + planilha.total_amostras;
      }, 0);
    });

    // Ordenar por obra
    return Object.values(grouped).sort((a, b) => {
      return a.obra_id - b.obra_id;
    });
  };

  const groupedObras = getGroupedObras();
  const groupedPlanilhas = getGroupedPlanilhas();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Planilhas de Concreto</CardTitle>
            <CardDescription>
              Registre as cargas de concreto e gere amostras automaticamente
            </CardDescription>
          </div>
        </div>

        {/* Seleção de Obra FORA do formulário */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Label className="text-blue-900 mb-2 block">
            🏗️ Selecione a Obra
          </Label>
          {works.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Nenhuma obra cadastrada. Por favor, cadastre uma obra na aba{" "}
                <strong>"Obras"</strong> antes de criar planilhas.
              </p>
            </div>
          ) : (
            <>
              <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione uma obra para cadastrar planilhas" />
                </SelectTrigger>
                <SelectContent>
                  {works.map((work) => {
                    const company = companies.find(
                      (c) => c.id === work.empresa_id
                    );
                    const workLoads = loads.filter(
                      (l) => l.obra_id === work.id
                    );
                    const nextPlanilha =
                      workLoads.length > 0
                        ? Math.max(
                            ...workLoads.map((l) => l.invoice_number || 0)
                          ) + 1
                        : 1;

                    return (
                      <SelectItem key={work.id} value={work.id.toString()}>
                        {work.name} ({company?.name || "Sem empresa"}) - Próxima
                        planilha: #{nextPlanilha}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedWorkId && (
                <p className="text-sm text-blue-700 mt-2">
                  ✅ Todas as planilhas cadastradas serão vinculadas a:{" "}
                  <strong>
                    {works.find((w) => w.id === Number(selectedWorkId))?.name}
                  </strong>
                </p>
              )}
            </>
          )}
        </div>

        {/* Botão Nova Planilha */}
        <div className="mt-4">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open: boolean) => {
              if (open && !selectedWorkId && works.length > 0) {
                toast.error("Selecione uma obra antes de criar planilhas");
                return;
              }
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 w-full"
                disabled={!selectedWorkId && works.length > 0}
              >
                <Plus className="w-4 h-4" />
                {selectedWorkId
                  ? "Nova Planilha para esta Obra"
                  : works.length === 0
                  ? "Cadastre uma obra primeiro"
                  : "Selecione uma obra para começar"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLoad ? "Editar Carga" : "Adicionar Planilha"}
                </DialogTitle>
                <DialogDescription>
                  {editingLoad
                    ? "Edite os dados da carga de concreto"
                    : `Crie uma planilha com uma ou mais cargas (caminhões) para: ${
                        works.find((w) => w.id === Number(selectedWorkId))?.name
                      }`}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={editingLoad ? handleUpdateLoad : handleSubmit}>
                <div className="grid gap-6 py-4">
                  {/* Seleção de obra no modo edição */}
                  {editingLoad && (
                    <div className="grid gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label>Obra *</Label>
                      <Select
                        value={selectedWorkId}
                        onValueChange={setSelectedWorkId}
                        required
                        disabled={works.length === 0}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue
                            placeholder={
                              works.length === 0
                                ? "Nenhuma obra disponível"
                                : "Selecione uma obra"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {works.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              Cadastre uma obra primeiro
                            </div>
                          ) : (
                            works.map((work) => {
                              const company = companies.find(
                                (c) => c.id === work.empresa_id
                              );
                              return (
                                <SelectItem
                                  key={work.id}
                                  value={work.id.toString()}
                                >
                                  {work.name} ({company?.name || "Sem empresa"})
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* QUANTIDADE DE CARGAS (CAMINHÕES) */}
                  {!editingLoad && (
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">
                        Quantidade de Cargas (Caminhões) *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Você está criando uma planilha com{" "}
                        <strong>{formData.quantity} carga(s)</strong> para{" "}
                        <strong>
                          {
                            works.find((w) => w.id === Number(selectedWorkId))
                              ?.name
                          }
                        </strong>
                      </p>
                    </div>
                  )}

                  {/* CONFIGURAÇÃO DE AMOSTRAS */}
                  <div className="grid gap-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <Label className="text-blue-900">
                      ⚙️ Configuração de Amostras (aplicado a todas as cargas)
                    </Label>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="samples7d" className="text-sm">
                          Amostras 7 dias
                        </Label>
                        <Input
                          id="samples7d"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.samples7d}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              samples7d: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="samples14d" className="text-sm">
                          Amostras 14 dias
                        </Label>
                        <Input
                          id="samples14d"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.samples14d}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              samples14d: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="samples28d" className="text-sm">
                          Amostras 28 dias
                        </Label>
                        <Input
                          id="samples28d"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.samples28d}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              samples28d: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="samples63d" className="text-sm">
                          Amostras 63 dias
                        </Label>
                        <Input
                          id="samples63d"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.samples63d}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              samples63d: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <p className="text-sm text-blue-800">
                      ✅ Total: <strong>{getTotalSamples()} amostra(s)</strong>{" "}
                      serão geradas para cada carga
                    </p>
                  </div>

                  {/* DADOS DE CADA CARGA */}
                  <div className="space-y-4">
                    <h4 className="text-sm text-gray-600">
                      🚛 Dados de Cada Carga (Caminhão)
                    </h4>
                    {formData.loads.map((load, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <h4 className="text-gray-900">
                            Carga {index + 1} de {formData.loads.length}
                          </h4>
                        </div>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label>Nota Fiscal *</Label>
                            <Input
                              value={load.invoiceNumber}
                              onChange={(e) =>
                                updateLoadData(
                                  index,
                                  "invoiceNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: NF-123456"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Data Moldagem *</Label>
                              <Input
                                type="date"
                                value={load.deliveryDate}
                                onChange={(e) =>
                                  updateLoadData(
                                    index,
                                    "deliveryDate",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>FCK (MPa) *</Label>
                              <Input
                                type="number"
                                value={load.fck}
                                onChange={(e) =>
                                  updateLoadData(index, "fck", e.target.value)
                                }
                                placeholder="25"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Slump (mm) *</Label>
                              <Input
                                type="number"
                                value={load.slump}
                                onChange={(e) =>
                                  updateLoadData(index, "slump", e.target.value)
                                }
                                placeholder="100"
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Volume (m³) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={load.volume}
                                onChange={(e) =>
                                  updateLoadData(
                                    index,
                                    "volume",
                                    e.target.value
                                  )
                                }
                                placeholder="5.5"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
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
                                placeholder="Ex: Térreo, 1º Andar, Subsolo"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Peça Concretada</Label>
                              <Input
                                value={load.peca}
                                onChange={(e) =>
                                  updateLoadData(index, "peca", e.target.value)
                                }
                                placeholder="Ex: Viga, Pilar, Laje"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting || works.length === 0}
                  >
                    {editingLoad ? "Atualizar Carga" : `Cadastrar Planilha`}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {groupedObras.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhuma planilha cadastrada. Clique em "Nova Planilha" para começar.
          </div>
        ) : (
          <>
            {/* Resumo por obra */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm mb-3 text-blue-900">📊 Resumo Geral</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">Total de Planilhas</p>
                  <p className="text-gray-900">{groupedPlanilhas.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">Total de Cargas</p>
                  <p className="text-gray-900">{loads.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">Total de Amostras</p>
                  <p className="text-gray-900">{samples.length}</p>
                </div>
              </div>
            </div>

            {/* Lista de Planilhas Expansíveis */}
            <Accordion type="single" collapsible className="space-y-3">
              {groupedObras.map((obra, idx) => {
                return (
                  <AccordionItem
                    key={`obra-${obra.obra_id}`}
                    value={`obra-${idx}`}
                    className="border rounded-lg bg-white"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-gray-900">{obra.obra_nome}</p>
                            <p className="text-sm text-gray-600">
                              {obra.empresa_nome}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            {obra.total_cargas}{" "}
                            {obra.total_cargas === 1 ? "carga" : "cargas"}
                          </Badge>
                          <Badge variant="outline">
                            {obra.total_amostras}{" "}
                            {obra.total_amostras === 1 ? "amostra" : "amostras"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {/* Accordion aninhado para planilhas */}
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-2 pt-3"
                      >
                        {obra.planilhas.map((planilha, planilhaIdx) => {
                          return (
                            <AccordionItem
                              key={`planilha-${planilha.obra_id}-${planilha.numero_planilha}`}
                              value={`planilha-${planilhaIdx}`}
                              className="border rounded-lg bg-gray-50"
                            >
                              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-1.5 rounded">
                                      <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-900">
                                      Planilha #{planilha.numero_planilha}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {planilha.cargas.length}{" "}
                                      {planilha.cargas.length === 1
                                        ? "carga"
                                        : "cargas"}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {planilha.total_amostras} amostras
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3">
                                <div className="space-y-3 pt-3">
                                  {planilha.cargas.map((carga, cargaIdx) => {
                                    const cargaSamples = samples.filter(
                                      (s) => s.carga_id === carga.id
                                    );
                                    return (
                                      <div
                                        key={carga.id}
                                        className="p-3 bg-white rounded-lg border border-gray-200"
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-blue-600" />
                                            <h5 className="text-sm text-gray-900">
                                              Carga {cargaIdx + 1} de{" "}
                                              {planilha.cargas.length}
                                            </h5>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEdit(carga)}
                                              title="Editar carga"
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDelete(carga.id)
                                              }
                                              title="Excluir carga"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                          <div>
                                            <p className="text-gray-600">
                                              Nota Fiscal
                                            </p>
                                            <p className="text-gray-900">
                                              {carga.nota_fiscal || "N/A"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Data Moldagem
                                            </p>
                                            <p className="text-gray-900">
                                              {formatDateBR(
                                                carga.molding_date
                                              )}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">FCK</p>
                                            <p className="text-gray-900">
                                              {carga.fck_mpa} MPa
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Slump
                                            </p>
                                            <p className="text-gray-900">
                                              {carga.slump_cm} mm
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Volume
                                            </p>
                                            <p className="text-gray-900">
                                              {carga.volume_m3} m³
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Pavimento
                                            </p>
                                            <p className="text-gray-900">
                                              {carga.pavimento || "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Peça
                                            </p>
                                            <p className="text-gray-900">
                                              {carga.peca || "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Amostras Testadas
                                            </p>
                                            <p className="text-gray-900">
                                              {
                                                cargaSamples.filter(
                                                  (s) => s.resistencia_mpa
                                                ).length
                                              }
                                              /{cargaSamples.length}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}
