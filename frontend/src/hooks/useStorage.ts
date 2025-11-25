import { useEffect, useState } from "react";
import type { Work, Load, Sample } from "../types";

export function useStorage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);

  // Inicializa dados do localStorage
  useEffect(() => {
    setWorks(JSON.parse(localStorage.getItem("works") || "[]"));
    setLoads(JSON.parse(localStorage.getItem("loads") || "[]"));
    setSamples(JSON.parse(localStorage.getItem("samples") || "[]"));
  }, []);

  // Salvadores
  const saveWorks = (value: Work[]) => {
    setWorks(value);
    localStorage.setItem("works", JSON.stringify(value));
  };

  const saveLoads = (value: Load[]) => {
    setLoads(value);
    localStorage.setItem("loads", JSON.stringify(value));
  };

  const saveSamples = (value: Sample[]) => {
    setSamples(value);
    localStorage.setItem("samples", JSON.stringify(value));
  };

  return {
    works,
    loads,
    samples,
    saveWorks,
    saveLoads,
    saveSamples,
  };
}
