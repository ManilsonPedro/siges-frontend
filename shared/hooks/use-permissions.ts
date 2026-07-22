"use client";
import { useQuery } from "@tanstack/react-query";
import { permissoesService } from "@/shared/services/financeiro.service";

/**
 * Permissões do utilizador autenticado, vindas do seu Grupo (/auth/permissions).
 * O backend devolve a lista expandida de códigos (sem "*"), por isso `has` é
 * uma simples verificação de pertença.
 */
export function usePermissions() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: () => permissoesService.getMinhasPermissoes(),
    staleTime: 5 * 60 * 1000,
  });

  const permissions = data?.permissions ?? [];
  const grupoId = data?.grupo_id ?? null;
  const has = (code: string) => permissions.includes(code);
  const hasAny = (...codes: string[]) => codes.some((c) => permissions.includes(c));

  return { permissions, grupoId, has, hasAny, isLoading };
}
