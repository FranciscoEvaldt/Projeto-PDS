import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useStorage, type Load, type Sample } from '../hooks/useStorage';
import { toast } from 'sonner';

export function LoadsManager() {
  const { companies, works, loads, samples, saveLoads, saveSamples } = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');
  
  // Estado para carga única
  const [formData, setFormData] = useState({
    workId: '',
    loadNumber: '',
    invoiceNumber: '',
    fck: '',
    slump: '',
    deliveryDate: '',
    volume: '',
    samples7d: '0',
    samples14d: '0',
    samples28d: '2',
    samples63d: '0',
  });

  // Estado para múltiplas cargas
  const [multipleLoadsData, setMultipleLoadsData] = useState({
    workId: '',
    quantity: '1',
    samples7d: '0',
    samples14d: '0',
    samples28d: '2',
    samples63d: '0',
    loads: [] as Array<{
      loadNumber: string;
      invoiceNumber: string;
      fck: string;
      slump: string;
      deliveryDate: string;
      volume: string;
    }>,
  });

  const resetForm = () => {
    setFormData({
      workId: '',
      loadNumber: '',
      invoiceNumber: '',
      fck: '',
      slump: '',
      deliveryDate: '',
      volume: '',
      samples7d: '0',
      samples14d: '0',
      samples28d: '2',
      samples63d: '0',
    });
    setMultipleLoadsData({
      workId: '',
      quantity: '1',
      samples7d: '0',
      samples14d: '0',
      samples28d: '2',
      samples63d: '0',
      loads: [],
    });
    setEditingLoad(null);
    setAddMode('single');
  };

  const calculateTestDate = (moldingDate: string, age: number): string => {
    const date = new Date(moldingDate);
    date.setDate(date.getDate() + age);
    return date.toISOString().split('T')[0];
  };

  const generateSamples = (loadId: string, loadNumber: string, moldingDate: string, samplesConfig: { age: number; quantity: number }[]) => {
    const newSamples: Sample[] = [];
    
    samplesConfig.forEach(config => {
      for (let i = 1; i <= config.quantity; i++) {
        const sampleNumber = newSamples.filter(s => s.age === config.age).length + 1;
        newSamples.push({
          id: `${loadId}-${config.age}d-${i}`,
          loadId,
          code: `CP-${loadNumber}-${config.age}D-${sampleNumber}`,
          age: config.age,
          moldingDate,
          testDate: calculateTestDate(moldingDate, config.age),
        });
      }
    });
    
    saveSamples([...samples, ...newSamples]);
  };

  const getSamplesConfig = (isSingle: boolean) => {
    const data = isSingle ? formData : multipleLoadsData;
    const config: { age: number; quantity: number }[] = [];
    
    const qty7 = parseInt(data.samples7d) || 0;
    const qty14 = parseInt(data.samples14d) || 0;
    const qty28 = parseInt(data.samples28d) || 0;
    const qty63 = parseInt(data.samples63d) || 0;
    
    if (qty7 > 0) config.push({ age: 7, quantity: qty7 });
    if (qty14 > 0) config.push({ age: 14, quantity: qty14 });
    if (qty28 > 0) config.push({ age: 28, quantity: qty28 });
    if (qty63 > 0) config.push({ age: 63, quantity: qty63 });
    
    return config;
  };

  const getTotalSamples = (isSingle: boolean) => {
    const data = isSingle ? formData : multipleLoadsData;
    return (parseInt(data.samples7d) || 0) + 
           (parseInt(data.samples14d) || 0) + 
           (parseInt(data.samples28d) || 0) + 
           (parseInt(data.samples63d) || 0);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const samplesConfig = getSamplesConfig(true);
    
    if (samplesConfig.length === 0) {
      toast.error('Defina pelo menos uma amostra para moldar');
      return;
    }
    
    if (editingLoad) {
      const updatedLoads = loads.map(l =>
        l.id === editingLoad.id
          ? { 
              ...l, 
              workId: formData.workId,
              loadNumber: formData.loadNumber,
              invoiceNumber: formData.invoiceNumber,
              fck: Number(formData.fck), 
              slump: Number(formData.slump), 
              deliveryDate: formData.deliveryDate,
              volume: Number(formData.volume),
              samplesConfig,
            }
          : l
      );
      saveLoads(updatedLoads);
      toast.success('Carga atualizada com sucesso!');
    } else {
      const newLoad: Load = {
        id: Date.now().toString(),
        workId: formData.workId,
        loadNumber: formData.loadNumber,
        invoiceNumber: formData.invoiceNumber,
        fck: Number(formData.fck),
        slump: Number(formData.slump),
        deliveryDate: formData.deliveryDate,
        volume: Number(formData.volume),
        samplesConfig,
        createdAt: new Date().toISOString(),
      };
      saveLoads([...loads, newLoad]);
      
      // Gerar amostras automaticamente
      generateSamples(newLoad.id, formData.loadNumber, formData.deliveryDate, samplesConfig);
      
      toast.success('Carga cadastrada e amostras geradas com sucesso!');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleQuantityChange = (quantity: string) => {
    const num = parseInt(quantity) || 1;
    const currentLoads = multipleLoadsData.loads;
    
    if (num > currentLoads.length) {
      // Adicionar novas cargas vazias
      const newLoads = [...currentLoads];
      for (let i = currentLoads.length; i < num; i++) {
        newLoads.push({
          loadNumber: '',
          invoiceNumber: '',
          fck: '',
          slump: '',
          deliveryDate: '',
          volume: '',
        });
      }
      setMultipleLoadsData({ ...multipleLoadsData, quantity, loads: newLoads });
    } else {
      // Remover cargas excedentes
      setMultipleLoadsData({ 
        ...multipleLoadsData, 
        quantity, 
        loads: currentLoads.slice(0, num) 
      });
    }
  };

  const updateMultipleLoad = (index: number, field: string, value: string) => {
    const newLoads = [...multipleLoadsData.loads];
    newLoads[index] = { ...newLoads[index], [field]: value };
    setMultipleLoadsData({ ...multipleLoadsData, loads: newLoads });
  };

  const handleMultipleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const samplesConfig = getSamplesConfig(false);
    
    if (samplesConfig.length === 0) {
      toast.error('Defina pelo menos uma amostra para moldar');
      return;
    }
    
    const newLoads: Load[] = [];
    const timestamp = Date.now();
    
    multipleLoadsData.loads.forEach((loadData, index) => {
      const newLoad: Load = {
        id: `${timestamp}-${index}`,
        workId: multipleLoadsData.workId,
        loadNumber: loadData.loadNumber,
        invoiceNumber: loadData.invoiceNumber,
        fck: Number(loadData.fck),
        slump: Number(loadData.slump),
        deliveryDate: loadData.deliveryDate,
        volume: Number(loadData.volume),
        samplesConfig,
        createdAt: new Date().toISOString(),
      };
      newLoads.push(newLoad);
      
      // Gerar amostras para cada carga
      setTimeout(() => {
        generateSamples(newLoad.id, loadData.loadNumber, loadData.deliveryDate, samplesConfig);
      }, 100);
    });
    
    saveLoads([...loads, ...newLoads]);
    toast.success(`${newLoads.length} carga(s) cadastrada(s) com sucesso!`);
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (load: Load) => {
    setEditingLoad(load);
    
    const config = load.samplesConfig || [];
    const samples7d = config.find(c => c.age === 7)?.quantity || 0;
    const samples14d = config.find(c => c.age === 14)?.quantity || 0;
    const samples28d = config.find(c => c.age === 28)?.quantity || 0;
    const samples63d = config.find(c => c.age === 63)?.quantity || 0;
    
    setFormData({
      workId: load.workId,
      loadNumber: load.loadNumber,
      invoiceNumber: load.invoiceNumber,
      fck: load.fck.toString(),
      slump: load.slump.toString(),
      deliveryDate: load.deliveryDate,
      volume: load.volume.toString(),
      samples7d: samples7d.toString(),
      samples14d: samples14d.toString(),
      samples28d: samples28d.toString(),
      samples63d: samples63d.toString(),
    });
    setAddMode('single');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta carga? As amostras relacionadas também serão excluídas.')) {
      saveLoads(loads.filter(l => l.id !== id));
      saveSamples(samples.filter(s => s.loadId !== id));
      toast.success('Carga excluída com sucesso!');
    }
  };

  const getSamplesDescription = (config: { age: number; quantity: number }[]) => {
    if (!config || config.length === 0) return 'Nenhuma amostra';
    
    const parts = config.map(c => `${c.quantity}×${c.age}d`);
    return parts.join(' + ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Relatórios de Concreto</CardTitle>
            <CardDescription>Registre as cargas de concreto e gere amostras automaticamente</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLoad ? 'Editar Relatório' : 'Adicionar Relatório(s)'}
                </DialogTitle>
                <DialogDescription>
                  {editingLoad 
                    ? 'Edite os dados da carga de concreto'
                    : 'Escolha entre adicionar um relatório ou múltiplos relatórios de uma vez'
                  }
                </DialogDescription>
              </DialogHeader>

              {!editingLoad && (
                <Tabs value={addMode} onValueChange={(v) => setAddMode(v as 'single' | 'multiple')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Relatório Único</TabsTrigger>
                    <TabsTrigger value="multiple">Múltiplos Relatórios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single">
                    <form onSubmit={handleSingleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="workId">Obra</Label>
                          <Select
                            value={formData.workId}
                            onValueChange={(value) => setFormData({ ...formData, workId: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma obra" />
                            </SelectTrigger>
                            <SelectContent>
                              {works.filter(w => w.status === 'active').map((work) => {
                                const company = companies.find(c => c.id === work.companyId);
                                return (
                                  <SelectItem key={work.id} value={work.id}>
                                    {work.name} ({company?.name})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="loadNumber">Número da Carga</Label>
                            <Input
                              id="loadNumber"
                              value={formData.loadNumber}
                              onChange={(e) => setFormData({ ...formData, loadNumber: e.target.value })}
                              placeholder="Ex: 001/2025"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="invoiceNumber">Nota Fiscal</Label>
                            <Input
                              id="invoiceNumber"
                              value={formData.invoiceNumber}
                              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                              placeholder="Ex: NF-123456"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="deliveryDate">Data de Moldagem</Label>
                          <Input
                            id="deliveryDate"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="fck">FCK (MPa)</Label>
                            <Input
                              id="fck"
                              type="number"
                              value={formData.fck}
                              onChange={(e) => setFormData({ ...formData, fck: e.target.value })}
                              placeholder="Ex: 25"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="slump">Slump (mm)</Label>
                            <Input
                              id="slump"
                              type="number"
                              value={formData.slump}
                              onChange={(e) => setFormData({ ...formData, slump: e.target.value })}
                              placeholder="Ex: 100"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="volume">Volume (m³)</Label>
                            <Input
                              id="volume"
                              type="number"
                              step="0.01"
                              value={formData.volume}
                              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                              placeholder="Ex: 5.5"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <Label className="text-blue-900">Quantas amostras serão moldadas?</Label>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="samples7d" className="text-sm">Amostras 7 dias</Label>
                              <Input
                                id="samples7d"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.samples7d}
                                onChange={(e) => setFormData({ ...formData, samples7d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples14d" className="text-sm">Amostras 14 dias</Label>
                              <Input
                                id="samples14d"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.samples14d}
                                onChange={(e) => setFormData({ ...formData, samples14d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples28d" className="text-sm">Amostras 28 dias</Label>
                              <Input
                                id="samples28d"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.samples28d}
                                onChange={(e) => setFormData({ ...formData, samples28d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples63d" className="text-sm">Amostras 63 dias</Label>
                              <Input
                                id="samples63d"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.samples63d}
                                onChange={(e) => setFormData({ ...formData, samples63d: e.target.value })}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-blue-800">
                            Total: <strong>{getTotalSamples(true)} amostra(s)</strong> serão moldadas para esta carga
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          Cadastrar e Gerar Amostras
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="multiple">
                    <form onSubmit={handleMultipleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="multiWorkId">Obra</Label>
                            <Select
                              value={multipleLoadsData.workId}
                              onValueChange={(value) => setMultipleLoadsData({ ...multipleLoadsData, workId: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma obra" />
                              </SelectTrigger>
                              <SelectContent>
                                {works.filter(w => w.status === 'active').map((work) => {
                                  const company = companies.find(c => c.id === work.companyId);
                                  return (
                                    <SelectItem key={work.id} value={work.id}>
                                      {work.name} ({company?.name})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantidade de Cargas</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max="20"
                              value={multipleLoadsData.quantity}
                              onChange={(e) => handleQuantityChange(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <Label className="text-blue-900">Quantas amostras por relatório? (aplicado a todos)</Label>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="samples7d-multi" className="text-sm">Amostras 7 dias</Label>
                              <Input
                                id="samples7d-multi"
                                type="number"
                                min="0"
                                max="10"
                                value={multipleLoadsData.samples7d}
                                onChange={(e) => setMultipleLoadsData({ ...multipleLoadsData, samples7d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples14d-multi" className="text-sm">Amostras 14 dias</Label>
                              <Input
                                id="samples14d-multi"
                                type="number"
                                min="0"
                                max="10"
                                value={multipleLoadsData.samples14d}
                                onChange={(e) => setMultipleLoadsData({ ...multipleLoadsData, samples14d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples28d-multi" className="text-sm">Amostras 28 dias</Label>
                              <Input
                                id="samples28d-multi"
                                type="number"
                                min="0"
                                max="10"
                                value={multipleLoadsData.samples28d}
                                onChange={(e) => setMultipleLoadsData({ ...multipleLoadsData, samples28d: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="samples63d-multi" className="text-sm">Amostras 63 dias</Label>
                              <Input
                                id="samples63d-multi"
                                type="number"
                                min="0"
                                max="10"
                                value={multipleLoadsData.samples63d}
                                onChange={(e) => setMultipleLoadsData({ ...multipleLoadsData, samples63d: e.target.value })}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-blue-800">
                            Total: <strong>{getTotalSamples(false)} amostra(s)</strong> por relatório
                          </p>
                        </div>

                        <div className="border-t pt-4 space-y-6">
                          {multipleLoadsData.loads.map((load, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex items-center gap-2 mb-3">
                                <Package className="w-4 h-4 text-blue-600" />
                                <h4 className="text-gray-900">Relatório {index + 1}</h4>
                              </div>
                              <div className="grid gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="grid gap-2">
                                    <Label>Número da Carga</Label>
                                    <Input
                                      value={load.loadNumber}
                                      onChange={(e) => updateMultipleLoad(index, 'loadNumber', e.target.value)}
                                      placeholder="Ex: 001/2025"
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Nota Fiscal</Label>
                                    <Input
                                      value={load.invoiceNumber}
                                      onChange={(e) => updateMultipleLoad(index, 'invoiceNumber', e.target.value)}
                                      placeholder="Ex: NF-123456"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                  <div className="grid gap-2">
                                    <Label>Data Moldagem</Label>
                                    <Input
                                      type="date"
                                      value={load.deliveryDate}
                                      onChange={(e) => updateMultipleLoad(index, 'deliveryDate', e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>FCK (MPa)</Label>
                                    <Input
                                      type="number"
                                      value={load.fck}
                                      onChange={(e) => updateMultipleLoad(index, 'fck', e.target.value)}
                                      placeholder="25"
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Slump (mm)</Label>
                                    <Input
                                      type="number"
                                      value={load.slump}
                                      onChange={(e) => updateMultipleLoad(index, 'slump', e.target.value)}
                                      placeholder="100"
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Volume (m³)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={load.volume}
                                      onChange={(e) => updateMultipleLoad(index, 'volume', e.target.value)}
                                      placeholder="5.5"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          Cadastrar {multipleLoadsData.loads.length} Relatório(s)
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                </Tabs>
              )}

              {editingLoad && (
                <form onSubmit={handleSingleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="workId">Obra</Label>
                      <Select
                        value={formData.workId}
                        onValueChange={(value) => setFormData({ ...formData, workId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {works.filter(w => w.status === 'active').map((work) => {
                            const company = companies.find(c => c.id === work.companyId);
                            return (
                              <SelectItem key={work.id} value={work.id}>
                                {work.name} ({company?.name})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="loadNumber">Número da Carga</Label>
                        <Input
                          id="loadNumber"
                          value={formData.loadNumber}
                          onChange={(e) => setFormData({ ...formData, loadNumber: e.target.value })}
                          placeholder="Ex: 001/2025"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="invoiceNumber">Nota Fiscal</Label>
                        <Input
                          id="invoiceNumber"
                          value={formData.invoiceNumber}
                          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                          placeholder="Ex: NF-123456"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deliveryDate">Data de Moldagem</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fck">FCK (MPa)</Label>
                        <Input
                          id="fck"
                          type="number"
                          value={formData.fck}
                          onChange={(e) => setFormData({ ...formData, fck: e.target.value })}
                          placeholder="Ex: 25"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="slump">Slump (mm)</Label>
                        <Input
                          id="slump"
                          type="number"
                          value={formData.slump}
                          onChange={(e) => setFormData({ ...formData, slump: e.target.value })}
                          placeholder="Ex: 100"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="volume">Volume (m³)</Label>
                        <Input
                          id="volume"
                          type="number"
                          step="0.01"
                          value={formData.volume}
                          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                          placeholder="Ex: 5.5"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <Label className="text-blue-900">Quantas amostras serão moldadas?</Label>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="samples7d-edit" className="text-sm">Amostras 7 dias</Label>
                          <Input
                            id="samples7d-edit"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.samples7d}
                            onChange={(e) => setFormData({ ...formData, samples7d: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="samples14d-edit" className="text-sm">Amostras 14 dias</Label>
                          <Input
                            id="samples14d-edit"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.samples14d}
                            onChange={(e) => setFormData({ ...formData, samples14d: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="samples28d-edit" className="text-sm">Amostras 28 dias</Label>
                          <Input
                            id="samples28d-edit"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.samples28d}
                            onChange={(e) => setFormData({ ...formData, samples28d: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="samples63d-edit" className="text-sm">Amostras 63 dias</Label>
                          <Input
                            id="samples63d-edit"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.samples63d}
                            onChange={(e) => setFormData({ ...formData, samples63d: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-blue-800">
                        Total: <strong>{getTotalSamples(true)} amostra(s)</strong> serão moldadas para esta carga
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Atualizar
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loads.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Nenhum relatório cadastrado. Clique em "Novo Relatório" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Carga</TableHead>
                <TableHead>Nota Fiscal</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Data Moldagem</TableHead>
                <TableHead>FCK</TableHead>
                <TableHead>Slump</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Amostras</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loads.map((load) => {
                const work = works.find(w => w.id === load.workId);
                const loadSamples = samples.filter(s => s.loadId === load.id);
                return (
                  <TableRow key={load.id}>
                    <TableCell>{load.loadNumber}</TableCell>
                    <TableCell>{load.invoiceNumber}</TableCell>
                    <TableCell>{work?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(load.deliveryDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{load.fck} MPa</TableCell>
                    <TableCell>{load.slump} mm</TableCell>
                    <TableCell>{load.volume} m³</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {loadSamples.length} ({getSamplesDescription(load.samplesConfig)})
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(load)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(load.id)}
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
