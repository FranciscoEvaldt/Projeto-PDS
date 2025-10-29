import { useEffect, useState } from "react";
import api from "../services/api";

interface Obra {
  id: number;
  nome: string;
}

interface Carga {
  id: number;
  caminhao: string;
  nota_fiscal: string;
  data_moldagem: string;
}

interface Amostra {
  id: number;
  sequencia: number;
  idade_dias: number;
  data_prevista_rompimento: string;
  data_rompimento?: string;
  carga_quebrada_kn?: number;
  resistencia_calculada_mpa?: number;
}

export default function Amostras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState<number>();
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [cargaId, setCargaId] = useState<number>();
  const [amostras, setAmostras] = useState<Amostra[]>([]);

  // 🔹 Carregar obras
  useEffect(() => {
    api.get("/obras").then((res) => setObras(res.data));
  }, []);

  // 🔹 Carregar cargas da obra
  useEffect(() => {
    if (obraId) {
      api.get(`/cargas?obra_id=${obraId}`).then((res) => setCargas(res.data));
    }
  }, [obraId]);

  // 🔹 Carregar amostras da carga
  useEffect(() => {
    if (cargaId) {
      api.get(`/amostras?carga_id=${cargaId}`).then((res) => setAmostras(res.data));
    }
  }, [cargaId]);

  // 🔹 Gerar amostras automáticas
  const gerarAmostras = async () => {
    if (!cargaId) return alert("Selecione uma carga");
    const carga = cargas.find((c) => c.id === cargaId);
    if (!carga) return;
    await api.post("/amostras/gerar", {
      carga_id: cargaId,
      data_moldagem: carga.data_moldagem,
    });
    const res = await api.get(`/amostras?carga_id=${cargaId}`);
    setAmostras(res.data);
  };

  // 🔹 Registrar rompimento
  const registrarRompimento = async (id: number, carga_quebrada_kn: number) => {
    await api.put("/amostras/romper", {
      id,
      data_rompimento: new Date().toISOString().split("T")[0],
      carga_quebrada_kn,
    });
    const res = await api.get(`/amostras?carga_id=${cargaId}`);
    setAmostras(res.data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Amostras</h1>

      {/* Escolher obra e carga */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={obraId ?? ""}
          onChange={(e) => setObraId(Number(e.target.value))}
        >
          <option value="">Selecione a obra</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={cargaId ?? ""}
          onChange={(e) => setCargaId(Number(e.target.value))}
        >
          <option value="">Selecione a carga</option>
          {cargas.map((c) => (
            <option key={c.id} value={c.id}>
              {`${c.caminhao} - NF ${c.nota_fiscal} - ${new Date(
                c.data_moldagem
              ).toLocaleDateString()}`}
            </option>
          ))}
        </select>

        <button
          onClick={gerarAmostras}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Gerar Amostras (7 e 28 dias)
        </button>
      </div>

      {/* Lista de amostras */}
      {amostras.length > 0 && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Seq.</th>
              <th className="border p-2">Idade (dias)</th>
              <th className="border p-2">Data Prevista</th>
              <th className="border p-2">Data Rompimento</th>
              <th className="border p-2">Carga (kN)</th>
              <th className="border p-2">Resistência (MPa)</th>
              <th className="border p-2">Registrar</th>
            </tr>
          </thead>
          <tbody>
            {amostras.map((a) => (
              <tr key={a.id}>
                <td className="border p-2">{a.sequencia}</td>
                <td className="border p-2">{a.idade_dias}</td>
                <td className="border p-2">
                  {new Date(a.data_prevista_rompimento).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  {a.data_rompimento
                    ? new Date(a.data_rompimento).toLocaleDateString()
                    : "-"}
                </td>
                <td className="border p-2">{a.carga_quebrada_kn ?? "-"}</td>
                <td className="border p-2">
                  {a.resistencia_calculada_mpa?.toFixed(2) ?? "-"}
                </td>
                <td className="border p-2">
                  {!a.data_rompimento && (
                    <button
                      onClick={() => {
                        const valor = prompt("Informe a carga de ruptura (kN):");
                        if (valor) registrarRompimento(a.id, Number(valor));
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Romper
                    </button>
                    
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
