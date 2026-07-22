"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecommerceService } from "@/shared/services/financeiro.service";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings2, Loader2 } from "lucide-react";

export default function EcommerceConfigPage() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ["ecommerce-config"], queryFn: ecommerceService.getConfig });

  const [dominio, setDominio] = useState("");
  const [tema, setTema] = useState("default");
  const [activo, setActivo] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [clickCollect, setClickCollect] = useState(true);
  const [moeda, setMoeda] = useState("AOA");

  useEffect(() => {
    if (config) {
      setDominio(config.dominio || "");
      setTema(config.tema);
      setActivo(config.activo);
      setDelivery(config.metodos_entrega.includes("delivery"));
      setClickCollect(config.metodos_entrega.includes("click_collect"));
      setMoeda(config.moeda);
    }
  }, [config]);

  const saveMut = useMutation({
    mutationFn: () => {
      const metodos_entrega: string[] = [];
      if (delivery) metodos_entrega.push("delivery");
      if (clickCollect) metodos_entrega.push("click_collect");
      return ecommerceService.updateConfig({ dominio, tema, activo, metodos_entrega, moeda });
    },
    onSuccess: () => { toast.success("Configuração guardada"); qc.invalidateQueries({ queryKey: ["ecommerce-config"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings2 className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Configuração da Loja Online</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Domínio</label>
          <input value={dominio} onChange={(e) => setDominio(e.target.value)} placeholder="loja.exemplo.com"
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tema</label>
            <input value={tema} onChange={(e) => setTema(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Moeda</label>
            <input value={moeda} onChange={(e) => setMoeda(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Métodos de entrega</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
              <span className="text-sm">Delivery</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={clickCollect} onChange={(e) => setClickCollect(e.target.checked)} />
              <span className="text-sm">Click & Collect</span>
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span className="text-sm">Loja online activa</span>
        </label>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saveMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
