import { useState } from "react";
import { toast } from "sonner";
import { formatDateBR } from "../utils/dateHelpers";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { FlaskConical, Calendar } from "lucide-react";
import { Sample } from "@/types";

export function SamplesManager() {
  const { works, loads, samples, updateSample } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [resultData, setResultData] = useState({
    result: "",
    kgf: "",
  });

  const calculateResult = (kgf: number) => {
    const gravidade = 10;
    const area = 7.854;
    return (kgf * gravidade) / area;
  };

  console.log("🔍 SamplesManager Debug:", {
    totalSamples: samples.length,
    totalLoads: loads.length,
    totalWorks: works.length,
    samples: samples.map((s) => ({
      id: s.id,
      num_lab: s.numero_laboratorio,
      sequencia: s.sequencia,
      carga_id: s.carga_id,
      idade: s.idade_dias,
    })),
    loads: loads.map((l) => ({
      id: l.id,
      obra_id: l.obra_id,
      caminhao: l.caminhao,
    })),
  });

  const handleRegisterResult = (sample: Sample) => {
    setSelectedSample(sample);
    setResultData({
      result: sample.resistencia_mpa?.toString() || "",
      kgf: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedSample) return;

    try {
      await updateSample(selectedSample.id, {
        resistencia_mpa: Number(resultData.result),
        data_rompimento: new Date().toISOString().split("T")[0],
        status: "tested",
      });

      toast.success("Resultado registrado com sucesso!");
      setIsDialogOpen(false);
      setSelectedSample(null);
      setResultData({ result: "", kgf: "" });
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const getComplianceStatus = (result: number, targetFck: number) => {
    const percentage = (result / targetFck) * 100;
    if (percentage >= 100) {
      return {
        label: "Aprovado",
        variant: "default" as const,
        color: "text-green-600",
      };
    } else if (percentage >= 90) {
      return {
        label: "Atenção",
        variant: "outline" as const,
        color: "text-yellow-600",
      };
    } else {
      return {
        label: "Reprovado",
        variant: "destructive" as const,
        color: "text-red-600",
      };
    }
  };

  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    loads.forEach((load) => {
      if (load.data_moldagem) {
        const date = new Date(load.data_moldagem + "T00:00:00");
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthsSet.add(monthKey);
      }
    });
    return Array.from(monthsSet).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const filteredSamples =
    selectedMonth === "all"
      ? samples
      : samples.filter((sample) => {
          const load = loads.find((l) => l.id === sample.carga_id);
          if (!load || !load.data_moldagem) return false;
          const date = new Date(load.data_moldagem + "T00:00:00");
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          return monthKey === selectedMonth;
        });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Amostras</CardTitle>
        <CardDescription>
          Acompanhe as amostras e registre os resultados dos ensaios
        </CardDescription>
      </CardHeader>
      <CardContent>
        {samples.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhuma amostra gerada. Cadastre planilhas de concreto para gerar
            amostras automaticamente.
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Filtrar por período:</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 Todos os períodos</SelectItem>
                  {availableMonths.map((monthKey) => (
                    <SelectItem key={monthKey} value={monthKey}>
                      {formatMonthLabel(monthKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">
                  {filteredSamples.length}
                </span>{" "}
                de {samples.length} amostras
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Lab</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Obra / Planilha</TableHead>
                  <TableHead>NF</TableHead>
                  <TableHead>Volume (m³)</TableHead>
                  <TableHead>FCK</TableHead>
                  <TableHead>Pavimento</TableHead>
                  <TableHead>Peça</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Data Moldagem</TableHead>
                  <TableHead>Data Ensaio</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSamples.map((sample) => {
                  const load = loads.find((l) => l.id === sample.carga_id);
                  const work = works.find((w) => w.id === load?.obra_id);
                  const compliance =
                    sample.resistencia_mpa && load?.fck_mpa
                      ? getComplianceStatus(
                          Number(sample.resistencia_mpa),
                          load.fck_mpa
                        )
                      : null;

                  if (!load) {
                    console.warn(
                      `⚠️ Amostra ${sample.id} (CP-${sample.sequencia}) não encontrou carga ${sample.carga_id}`
                    );
                  }

                  return (
                    <TableRow key={sample.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-blue-600">
                          {sample.numero_laboratorio || "?"}
                        </span>
                      </TableCell>
                      <TableCell>
                        CP-{sample.sequencia}
                        <span className="text-xs text-gray-400 ml-1">
                          (#{sample.carga_id})
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{work?.nome || "N/A"}</span>
                          <span className="text-xs text-blue-600">
                            Planilha #{load?.numero_planilha || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {load?.nota_fiscal || "N/A"}
                      </TableCell>
                      <TableCell>
                        {load?.volume_m3 ? `${load.volume_m3} m³` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {load?.fck_mpa ? `${load.fck_mpa} MPa` : "N/A"}
                      </TableCell>
                      <TableCell>{load?.pavimento || "-"}</TableCell>
                      <TableCell>{load?.peca || "-"}</TableCell>
                      <TableCell>{sample.idade_dias} dias</TableCell>
                      <TableCell>{formatDateBR(load?.data_moldagem)}</TableCell>
                      <TableCell>
                        {formatDateBR(sample.data_prevista_rompimento)}
                      </TableCell>
                      <TableCell>
                        {sample.resistencia_mpa ? (
                          <span className={compliance?.color}>
                            {Number(sample.resistencia_mpa).toFixed(2)} MPa
                          </span>
                        ) : (
                          <span className="text-gray-500">Pendente</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={
                            sample.resistencia_mpa ? "outline" : "default"
                          }
                          onClick={() => handleRegisterResult(sample)}
                        >
                          <FlaskConical className="w-4 h-4 mr-2" />
                          {sample.resistencia_mpa ? "Editar" : "Registrar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Resultado do Ensaio</DialogTitle>
              <DialogDescription>
                Amostra: CP-{selectedSample?.sequencia}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="kgf">Carga de Ruptura (kgf)</Label>
                  <Input
                    id="kgf"
                    type="number"
                    step="0.01"
                    value={resultData.kgf}
                    onChange={(e) => {
                      const kgfValue = parseFloat(e.target.value);
                      setResultData({
                        kgf: e.target.value,
                        result: kgfValue
                          ? calculateResult(kgfValue).toFixed(2)
                          : "",
                      });
                    }}
                    placeholder="Ex: 225.0"
                  />
                  <p className="text-xs text-gray-500">
                    Digite a carga de ruptura e o resultado em MPa será
                    calculado automaticamente
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="result">
                    Resistência à Compressão (MPa) *
                  </Label>
                  <Input
                    id="result"
                    type="number"
                    step="0.01"
                    value={resultData.result}
                    onChange={(e) =>
                      setResultData({ ...resultData, result: e.target.value })
                    }
                    placeholder="Ex: 28.5"
                    required
                  />
                  {selectedSample &&
                    loads.find((l) => l.id === selectedSample.carga_id) && (
                      <p className="text-sm text-gray-600">
                        FCK esperado:{" "}
                        {
                          loads.find((l) => l.id === selectedSample.carga_id)
                            ?.fck_mpa
                        }{" "}
                        MPa
                      </p>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Resultado"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
