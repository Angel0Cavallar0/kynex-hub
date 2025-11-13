import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

const emptyColaborador = {
  id_colaborador: null as string | null,
  nome: "",
  sobrenome: "",
  apelido: "",
  cargo: "",
  email_corporativo: "",
  whatsapp: "",
  foto_url: null as string | null,
};

const emptyPrivateData = {
  email_pessoal: "",
  telefone_pessoal: "",
  cpf: "",
  rg: "",
  data_nascimento: "",
  endereco: "",
  contato_emergencia_nome: "",
  contato_emergencia_telefone: "",
};

type ColaboradorFormState = typeof emptyColaborador;
type PrivateFormState = typeof emptyPrivateData;

type ColaboradorRow = Database["public"]["Tables"]["colaborador"]["Row"];
type ColaboradorPrivateRow = Database["public"]["Tables"]["colaborador_private"]["Row"];

function normalizeDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0] ?? "";
  }
  return date.toISOString().split("T")[0] ?? "";
}

function parseEmergencyContact(value: ColaboradorPrivateRow["contato_emergencia"]) {
  if (!value) {
    return { nome: "", telefone: "" };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return {
        nome: typeof parsed?.nome === "string" ? parsed.nome : "",
        telefone: typeof parsed?.telefone === "string" ? parsed.telefone : "",
      };
    } catch (error) {
      const [nome, telefone] = value.split("|").map((part) => part.trim());
      return { nome: nome ?? value, telefone: telefone ?? "" };
    }
  }

  if (typeof value === "object") {
    return {
      nome: typeof value.nome === "string" ? value.nome : "",
      telefone: typeof value.telefone === "string" ? value.telefone : "",
    };
  }

  return { nome: "", telefone: "" };
}

function buildEmergencyPayload({ nome, telefone }: { nome: string; telefone: string }) {
  if (!nome && !telefone) return null;
  return JSON.stringify({ nome, telefone });
}

export default function Perfil() {
  const { user } = useAuth();
  const [colaborador, setColaborador] = useState<ColaboradorFormState>(emptyColaborador);
  const [privateData, setPrivateData] = useState<PrivateFormState>(emptyPrivateData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (colaborador.apelido) return colaborador.apelido;
    const parts = [colaborador.nome, colaborador.sobrenome].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.email ?? "";
  }, [colaborador.apelido, colaborador.nome, colaborador.sobrenome, user?.email]);

  const initials = useMemo(() => {
    if (!displayName) return "?";
    const [first = "", second = ""] = displayName.trim().split(/\s+/);
    const firstInitial = first.charAt(0);
    const secondInitial = second.charAt(0);
    const combined = `${firstInitial}${secondInitial}`.toUpperCase();
    if (combined.trim().length > 0) return combined;
    if (firstInitial) return firstInitial.toUpperCase();
    return "?";
  }, [displayName]);

  useEffect(() => {
    if (!photoFile) return;

    const preview = URL.createObjectURL(photoFile);
    setPhotoPreview(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [photoFile]);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setColaborador({ ...emptyColaborador });
      setPrivateData({ ...emptyPrivateData });
      setError("Usuário não autenticado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: colaboradorData, error: colaboradorError } = await supabase
        .from("colaborador")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (colaboradorError) {
        throw colaboradorError;
      }

      if (!colaboradorData) {
        setColaborador({ ...emptyColaborador });
        setPrivateData({ ...emptyPrivateData });
        setPhotoPreview(null);
        setError("Não encontramos um cadastro de colaborador vinculado a este usuário.");
        return;
      }

      const colaboradorRow = colaboradorData as ColaboradorRow;

      setColaborador({
        id_colaborador: colaboradorRow.id_colaborador ?? null,
        nome: colaboradorRow.nome ?? "",
        sobrenome: colaboradorRow.sobrenome ?? "",
        apelido: colaboradorRow.apelido ?? "",
        cargo: colaboradorRow.cargo ?? "",
        email_corporativo: colaboradorRow.email_corporativo ?? "",
        whatsapp: colaboradorRow.whatsapp ?? "",
        foto_url: colaboradorRow.foto_url ?? null,
      });
      setPhotoPreview(colaboradorRow.foto_url ?? null);

      if (colaboradorRow.id_colaborador) {
        const { data: privateRow, error: privateError } = await supabase
          .from("colaborador_private")
          .select("*")
          .eq("id_colaborador", colaboradorRow.id_colaborador)
          .maybeSingle();

        if (privateError) {
          throw privateError;
        }

        if (privateRow) {
          const privateDataRow = privateRow as ColaboradorPrivateRow;
          const emergency = parseEmergencyContact(privateDataRow.contato_emergencia);

          setPrivateData({
            email_pessoal: privateDataRow.email_pessoal ?? "",
            telefone_pessoal: privateDataRow.telefone_pessoal ?? "",
            cpf: privateDataRow.cpf ?? "",
            rg: privateDataRow.rg ?? "",
            data_nascimento: normalizeDate(privateDataRow.data_aniversario),
            endereco: privateDataRow.endereco ?? "",
            contato_emergencia_nome: emergency.nome,
            contato_emergencia_telefone: emergency.telefone,
          });
        } else {
          setPrivateData({ ...emptyPrivateData });
        }
      }
    } catch (loadError) {
      console.error(loadError);
      await logger.error("Erro ao carregar dados do perfil", "PROFILE_LOAD_ERROR", {
        errorMessage: loadError instanceof Error ? loadError.message : String(loadError),
      });
      setError("Não foi possível carregar suas informações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleColaboradorChange = (field: keyof Omit<ColaboradorFormState, "id_colaborador" | "foto_url">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setColaborador((prev) => ({ ...prev, [field]: value }));
    };

  const handlePrivateChange = (field: keyof PrivateFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setPrivateData((prev) => ({ ...prev, [field]: value }));
    };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoFile(file ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!colaborador.id_colaborador) {
      toast.error("Não foi possível identificar o colaborador vinculado a este usuário.");
      return;
    }

    setSaving(true);

    try {
      let updatedPhotoUrl = colaborador.foto_url ?? null;

      if (photoFile) {
        const fileExtension = photoFile.name.split(".").pop() || "jpg";
        const filePath = `fotos_colaboradores/${colaborador.id_colaborador}-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("imagens")
          .upload(filePath, photoFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: photoFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from("imagens").getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Não foi possível gerar a URL pública da foto do colaborador");
        }

        updatedPhotoUrl = publicUrlData.publicUrl;
      }

      const collaboratorUpdates: Database["public"]["Tables"]["colaborador"]["Update"] = {
        nome: colaborador.nome || null,
        sobrenome: colaborador.sobrenome || null,
        apelido: colaborador.apelido || null,
        cargo: colaborador.cargo || null,
        email_corporativo: colaborador.email_corporativo || null,
        whatsapp: colaborador.whatsapp || null,
        foto_url: updatedPhotoUrl,
      };

      const { error: collaboratorError } = await supabase
        .from("colaborador")
        .update(collaboratorUpdates)
        .eq("id_colaborador", colaborador.id_colaborador);

      if (collaboratorError) {
        throw collaboratorError;
      }

      const emergencyPayload = buildEmergencyPayload({
        nome: privateData.contato_emergencia_nome,
        telefone: privateData.contato_emergencia_telefone,
      });

      const privatePayload: Database["public"]["Tables"]["colaborador_private"]["Insert"] = {
        id_colaborador: colaborador.id_colaborador,
        email_pessoal: privateData.email_pessoal || null,
        telefone_pessoal: privateData.telefone_pessoal || null,
        cpf: privateData.cpf || null,
        rg: privateData.rg || null,
        data_aniversario: privateData.data_nascimento || null,
        endereco: privateData.endereco || null,
        contato_emergencia: emergencyPayload,
      };

      const { error: privateError } = await supabase
        .from("colaborador_private")
        .upsert(privatePayload);

      if (privateError) {
        throw privateError;
      }

      if (photoFile) {
        setPhotoFile(null);
        setColaborador((prev) => ({ ...prev, foto_url: updatedPhotoUrl }));
        setPhotoPreview(updatedPhotoUrl);
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (submitError) {
      console.error(submitError);
      await logger.error("Erro ao atualizar perfil do colaborador", "PROFILE_UPDATE_ERROR", {
        errorMessage: submitError instanceof Error ? submitError.message : String(submitError),
      });
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Atualize suas informações pessoais e profissionais utilizadas nos sistemas internos.
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Carregando informações do perfil...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={loadProfile}>Tentar novamente</Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações profissionais</CardTitle>
                <CardDescription>Esses dados são utilizados pelas equipes internas e clientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt={displayName || "Foto do perfil"} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="w-full sm:max-w-xs">
                    <Label htmlFor="foto">Foto do perfil</Label>
                    <Input id="foto" type="file" accept="image/*" onChange={handlePhotoChange} />
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou WebP com até 5MB.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" value={colaborador.nome} onChange={handleColaboradorChange("nome")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input id="sobrenome" value={colaborador.sobrenome} onChange={handleColaboradorChange("sobrenome")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apelido">Apelido</Label>
                    <Input id="apelido" value={colaborador.apelido} onChange={handleColaboradorChange("apelido")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" value={colaborador.cargo} onChange={handleColaboradorChange("cargo")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_corporativo">E-mail corporativo</Label>
                    <Input
                      id="email_corporativo"
                      type="email"
                      value={colaborador.email_corporativo}
                      onChange={handleColaboradorChange("email_corporativo")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" value={colaborador.whatsapp} onChange={handleColaboradorChange("whatsapp")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações pessoais</CardTitle>
                <CardDescription>Essas informações são privadas e utilizadas apenas pelo time interno.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email_pessoal">E-mail pessoal</Label>
                    <Input
                      id="email_pessoal"
                      type="email"
                      value={privateData.email_pessoal}
                      onChange={handlePrivateChange("email_pessoal")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone_pessoal">Telefone pessoal</Label>
                    <Input
                      id="telefone_pessoal"
                      value={privateData.telefone_pessoal}
                      onChange={handlePrivateChange("telefone_pessoal")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={privateData.cpf} onChange={handlePrivateChange("cpf")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" value={privateData.rg} onChange={handlePrivateChange("rg")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={privateData.data_nascimento}
                      onChange={handlePrivateChange("data_nascimento")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contato_emergencia_nome">Contato de emergência</Label>
                    <Input
                      id="contato_emergencia_nome"
                      value={privateData.contato_emergencia_nome}
                      onChange={handlePrivateChange("contato_emergencia_nome")}
                      placeholder="Nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contato_emergencia_telefone">Telefone do contato</Label>
                    <Input
                      id="contato_emergencia_telefone"
                      value={privateData.contato_emergencia_telefone}
                      onChange={handlePrivateChange("contato_emergencia_telefone")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço residencial</Label>
                  <Textarea
                    id="endereco"
                    value={privateData.endereco}
                    onChange={handlePrivateChange("endereco")}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
