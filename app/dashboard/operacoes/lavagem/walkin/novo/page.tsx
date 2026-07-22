"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { operacoesLavagemService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Car, Loader2 } from "lucide-react";

export default function NovoWalkinPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome_cliente: "", telefone_cliente: "", matricula: "", marca: "", modelo: "", cor: "",
    categoria_veiculo_id: "", tipo_lavagem_id: "",
  });
  const [extraIds, setExtraIds] = useState<string[]>([]);

  const { data: tipos = [] } = useQuery({ queryKey: ["lavagem-tipos"], queryFn: operacoesLavagemService.listTipos });
  const { data: categorias = [] } = useQuery({ queryKey: ["lavagem-categorias"], queryFn: operacoesLavagemService.listCategoriasVeiculo });
  const { data: extras = [] } = useQuery({ queryKey: ["lavagem-extras"], queryFn: operacoesLavagemService.listExtras });

  const createMut = useMutation({
    mutationFn: () => operacoesLavagemService.createWalkin({
      ...form,
      categoria_veiculo_id: form.categoria_veiculo_id || undefined,
      extra_ids: extraIds,
    }),
    onSuccess: () => {
      toast.success("Walk-in criado — entrou na fila de atendimento");
      router.push("/dashboard/operacoes/lavagem/fila");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Car className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Novo Walk-in</h1>
      </div>
      <p className="text-sm text-ink-mid/70">
        Cliente chegou à estação sem reserva. Preencha o mínimo necessário — o registo entra directamente na fila de atendimento.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do cliente</label>
            <input value={form.nome_cliente} onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })}
              placeholder="Opcional" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input value={form.telefone_cliente} onChange={(e) => setForm({ ...form, telefone_cliente: e.target.value })}
              placeholder="Opcional" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Matrícula *</label>
          <input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria de veículo</label>
          <select value={form.categoria_veiculo_id} onChange={(e) => setForm({ ...form, categoria_veiculo_id: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
            <option value="">Não especificada</option>
            {categorias.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de lavagem *</label>
          <select value={form.tipo_lavagem_id} onChange={(e) => setForm({ ...form, tipo_lavagem_id: e.target.value })} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
            <option value="">Seleccionar…</option>
            {tipos.filter((t) => t.activo).map((t) => <option key={t.id} value={t.id}>{t.nome} — {t.preco_base.toLocaleString("pt-AO")} Kz</option>)}
          </select>
        </div>

        {extras.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Extras</label>
            <div className="space-y-1">
              {extras.filter((ex) => ex.activo).map((ex) => (
                <label key={ex.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={extraIds.includes(ex.id)}
                    onChange={(e) => setExtraIds(e.target.checked ? [...extraIds, ex.id] : extraIds.filter((id) => id !== ex.id))} />
                  {ex.nome} — {ex.preco.toLocaleString("pt-AO")} Kz
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={createMut.isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink text-white rounded-lg disabled:opacity-50">
          {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar walk-in"}
        </button>
      </form>
    </div>
  );
}
