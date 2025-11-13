import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClickupTarefas() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [filtroColaborador, setFiltroColaborador] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tarefasRes, clientesRes, colaboradoresRes, pastasRes] = await Promise.all([
      supabase
        .from("informacoes_tasks_clickup")
        .select(
          "id_subtask, nome_subtask, status, prioridade, id_colaborador_clickup, nome_colaborador, nome_lista, nome_pasta, data_entrega, id_pasta"
        ),
      supabase.from("clientes_infos").select("id_cliente, nome_cliente"),
      supabase
        .from("colaborador")
        .select("id_clickup, nome, sobrenome"),
      supabase
        .from("clientes_pastas_clickup")
        .select("id_pasta, id_cliente, nome_cliente"),
    ]);

    const pastaMap = (pastasRes.data || []).reduce(
      (acc, pasta) => {
        if (pasta.id_pasta) {
          acc[pasta.id_pasta] = {
            id_cliente: pasta.id_cliente,
            nome_cliente: pasta.nome_cliente,
          };
        }
        return acc;
      },
      {} as Record<string, { id_cliente: string | null; nome_cliente: string | null }>
    );

    if (tarefasRes.data) {
      setTarefas(
        tarefasRes.data.map((tarefa) => {
          const info = tarefa.id_pasta ? pastaMap[tarefa.id_pasta] : undefined;
          return {
            ...tarefa,
            clienteId: info?.id_cliente || null,
            clienteNome: info?.nome_cliente || null,
          };
        })
      );
    }
    if (clientesRes.data) setClientes(clientesRes.data);
    if (colaboradoresRes.data) setColaboradores(colaboradoresRes.data);
  };

  const statusOptions = Array.from(new Set(tarefas.map((t) => t.status).filter(Boolean)));

  const filteredTarefas = tarefas.filter((tarefa) => {
    if (filtroCliente && tarefa.clienteId !== filtroCliente) return false;
    if (filtroColaborador && tarefa.id_colaborador_clickup !== filtroColaborador) return false;
    if (filtroStatus && tarefa.status !== filtroStatus) return false;
    return true;
  });

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: any = {
      urgent: "destructive",
      high: "warning",
      normal: "default",
      low: "secondary",
    };
    return variants[prioridade?.toLowerCase()] || "default";
  };

  const isOverdue = (dataEntrega?: string | null, status?: string | null) => {
    if (!dataEntrega || status === "Concluído") return false;
    return new Date(dataEntrega) < new Date();
  };

  const overdueTasks = filteredTarefas.filter((tarefa) =>
    isOverdue(tarefa.data_entrega, tarefa.status)
  );

  const overdueCollaborators = Object.values(
    overdueTasks.reduce(
      (acc, tarefa) => {
        const key =
          tarefa.id_colaborador_clickup || tarefa.nome_colaborador || "sem-colaborador";
        if (!acc[key]) {
          acc[key] = {
            key,
            nome: tarefa.nome_colaborador || "Sem colaborador",
            count: 0,
          };
        }
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { key: string; nome: string; count: number }>
    )
  ).sort((a, b) => b.count - a.count);

  const overdueClients = Object.values(
    overdueTasks.reduce(
      (acc, tarefa) => {
        const key = tarefa.clienteId || tarefa.clienteNome || "sem-cliente";
        if (!acc[key]) {
          acc[key] = {
            key,
            nome: tarefa.clienteNome || "Sem cliente",
            count: 0,
          };
        }
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { key: string; nome: string; count: number }>
    )
  ).sort((a, b) => b.count - a.count);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas ClickUp</h1>
          <p className="text-muted-foreground">Visualize todas as tarefas do ClickUp</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Select value={filtroCliente} onValueChange={setFiltroCliente}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nome_cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroColaborador} onValueChange={setFiltroColaborador}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por colaborador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {colaboradores.map((colab) => (
                <SelectItem key={colab.id_clickup} value={colab.id_clickup || ""}>
                  {colab.nome} {colab.sobrenome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length ? (
                <ul className="space-y-2 text-sm">
                  {overdueTasks.map((tarefa) => (
                    <li key={tarefa.id_subtask} className="flex justify-between">
                      <span className="font-medium">{tarefa.nome_subtask}</span>
                      <span className="text-muted-foreground">
                        {tarefa.data_entrega
                          ? new Date(tarefa.data_entrega).toLocaleDateString("pt-BR")
                          : "-"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa atrasada.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colaboradores com atrasos</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueCollaborators.length ? (
                <ul className="space-y-2 text-sm">
                  {overdueCollaborators.map((colaborador) => (
                    <li key={colaborador.key} className="flex justify-between">
                      <span className="font-medium">{colaborador.nome}</span>
                      <span className="text-muted-foreground">{colaborador.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum colaborador com atrasos.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes com atrasos</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueClients.length ? (
                <ul className="space-y-2 text-sm">
                  {overdueClients.map((cliente) => (
                    <li key={cliente.key} className="flex justify-between">
                      <span className="font-medium">{cliente.nome}</span>
                      <span className="text-muted-foreground">{cliente.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum cliente com atrasos.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Lista</TableHead>
                <TableHead>Pasta</TableHead>
                <TableHead>Data Entrega</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTarefas.map((tarefa) => (
                <TableRow
                  key={tarefa.id_subtask}
                  className={isOverdue(tarefa.data_entrega, tarefa.status) ? "bg-destructive/10" : ""}
                >
                  <TableCell className="font-medium">{tarefa.nome_subtask}</TableCell>
                  <TableCell>{tarefa.clienteNome || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tarefa.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {tarefa.prioridade && (
                      <Badge variant={getPrioridadeBadge(tarefa.prioridade)}>
                        {tarefa.prioridade}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{tarefa.nome_colaborador}</TableCell>
                  <TableCell>{tarefa.nome_lista}</TableCell>
                  <TableCell>{tarefa.nome_pasta}</TableCell>
                  <TableCell>
                    {tarefa.data_entrega
                      ? new Date(tarefa.data_entrega).toLocaleDateString("pt-BR")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
