import { useEffect, useState } from "react";
import api from "../services/api";

interface Obra {
  id: number;
  nome: string;
}

interface Carga {
  id: number;
  obra_id: number;
  data_moldagem: string;
  caminhao: string;
  nota_fiscal: string;
  volume_m3: number;
  slump_cm: number;
  fck_mpa: number;
  pavimento: string;
  peca: string;
}

export default function Cargas() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number | null>(null);
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [novaCarga, setNovaCarga] = useState<Partial<Carga>>({});

  // Buscar obras para o select
  useEffect(() => {
    api.get("/obras").then((res) => setObras(res.data));
  }, []);

  // Buscar cargas da obra selecionada
  useEffect(() => {
    if (obraSelecionada) {
      api
        .get(`/cargas?obra_id=${obraSelecionada}`)
        .then((res) => setCargas(res.data));
    }
  }, [obraSelecionada]);

  // Adicionar carga
  const adicionarCarga = async () => {
    if (!obraSelecionada) return alert("Selecione uma obra primeiro!");
    const payload = { ...novaCarga, obra_id: obraSelecionada };
    const res = await api.post("/cargas", payload);
    setCargas([res.data, ...cargas]);
    setNovaCarga({});
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cargas de Concreto</h1>

      {/* Selecionar obra */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Obra:</label>
        <select
          className="border p-2 rounded"
          value={obraSelecionada ?? ""}
          onChange={(e) => setObraSelecionada(Number(e.target.value))}
        >
          <option value="">Selecione a obra</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Formulário de nova carga */}
      {obraSelecionada && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <input
            type="date"
            className="border p-2 rounded"
            value={novaCarga.data_moldagem || ""}
            onChange={(e) =>
              setNovaCarga({ ...novaCarga, data_moldagem: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Caminhão"
            value={novaCarga.caminhao || ""}
            onChange={(e) =>
              setNovaCarga({ ...novaCarga, caminhao: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Nota Fiscal"
            value={novaCarga.nota_fiscal || ""}
            onChange={(e) =>
              setNovaCarga({ ...novaCarga, nota_fiscal: e.target.value })
            }
          />
          <input
            type="number"
            step="0.1"
            className="border p-2 rounded"
            placeholder="Volume (m³)"
            value={novaCarga.volume_m3 || ""}
            onChange={(e) =>
              setNovaCarga({
                ...novaCarga,
                volume_m3: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Slump (cm)"
            value={novaCarga.slump_cm || ""}
            onChange={(e) =>
              setNovaCarga({
                ...novaCarga,
                slump_cm: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Fck (MPa)"
            value={novaCarga.fck_mpa || ""}
            onChange={(e) =>
              setNovaCarga({
                ...novaCarga,
                fck_mpa: parseFloat(e.target.value),
              })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Pavimento"
            value={novaCarga.pavimento || ""}
            onChange={(e) =>
              setNovaCarga({ ...novaCarga, pavimento: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Peça concretada"
            value={novaCarga.peca || ""}
            onChange={(e) =>
              setNovaCarga({ ...novaCarga, peca: e.target.value })
            }
          />
          <button
            onClick={adicionarCarga}
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-3"
          >
            Adicionar Carga
          </button>
        </div>
      )}

      {/* Lista de cargas */}
      {obraSelecionada && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Data Moldagem</th>
              <th className="p-2 border">Caminhão</th>
              <th className="p-2 border">Nota Fiscal</th>
              <th className="p-2 border">Volume (m³)</th>
              <th className="p-2 border">Slump (cm)</th>
              <th className="p-2 border">Fck (MPa)</th>
              <th className="p-2 border">Pavimento</th>
              <th className="p-2 border">Peça</th>
            </tr>
          </thead>
          <tbody>
            {cargas.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">
                  {new Date(c.data_moldagem).toLocaleDateString()}
                </td>
                <td className="border p-2">{c.caminhao}</td>
                <td className="border p-2">{c.nota_fiscal}</td>
                <td className="border p-2">{c.volume_m3}</td>
                <td className="border p-2">{c.slump_cm}</td>
                <td className="border p-2">{c.fck_mpa}</td>
                <td className="border p-2">{c.pavimento}</td>
                <td className="border p-2">{c.peca}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
