import { useEffect, useState } from "react";
import api from "../services/api";

interface Obra {
  id: number;
  nome: string;
  cidade: string;
  estado?: string;
  fck_projeto?: number;
  responsavel_obra?: string;
}

export default function Obras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [novaObra, setNovaObra] = useState<Partial<Obra>>({});

  // Buscar obras do backend
  useEffect(() => {
    api.get("/obras").then((res) => setObras(res.data));
  }, []);

  // Cadastrar nova obra
  const adicionarObra = async () => {
    const res = await api.post("/obras", novaObra);
    setObras([res.data, ...obras]);
    setNovaObra({});
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Obras</h1>

      {/* Formulário */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-1/3"
          placeholder="Nome da obra"
          value={novaObra.nome || ""}
          onChange={(e) => setNovaObra({ ...novaObra, nome: e.target.value })}
        />
        <input
          className="border p-2 rounded w-1/3"
          placeholder="Cidade"
          value={novaObra.cidade || ""}
          onChange={(e) => setNovaObra({ ...novaObra, cidade: e.target.value })}
        />
        <button
          onClick={adicionarObra}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      {/* Lista */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Cidade</th>
          </tr>
        </thead>
        <tbody>
          {obras.map((obra) => (
            <tr key={obra.id}>
              <td className="border p-2">{obra.id}</td>
              <td className="border p-2">{obra.nome}</td>
              <td className="border p-2">{obra.cidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
