import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminClinicSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "michellecaires2@hotmail.com",
    opening_hours: "",
    map_url: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadClinicData();
  }, [isAdmin, navigate]);

  const loadClinicData = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_location")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLocationId(data.id);
        setFormData({
          name: data.name || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          phone: data.phone || "",
          email: data.email || "michellecaires2@hotmail.com",
          opening_hours: data.opening_hours || "",
          map_url: data.map_url || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados da clínica:", error);
      toast.error("Erro ao carregar dados da clínica");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        opening_hours: formData.opening_hours || null,
        map_url: formData.map_url || null,
        is_active: true,
      };

      if (locationId) {
        const { error } = await supabase
          .from("clinic_location")
          .update(payload)
          .eq("id", locationId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("clinic_location")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setLocationId(data.id);
      }

      toast.success("Dados da clínica salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados da clínica");
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-rosa-bebe/20">
      <header className="bg-gradient-to-r from-azul-claro to-rosa-bebe p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🏥
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dados da Clínica</h1>
              <p className="text-sm text-muted-foreground">
                Informações usadas nos e-mails enviados aos pacientes
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <Card className="border-2 border-azul-claro/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Configurações da Clínica
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Estes dados aparecem nos e-mails de confirmação de consulta enviados aos pacientes.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Clínica *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Lumi Clínica Pediátrica"
                    value={formData.name}
                    onChange={set("name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço (Rua, Número, Bairro) *</Label>
                  <Input
                    id="address"
                    placeholder="Ex: Av. Artemia Postes, 8220, Bairro Sim"
                    value={formData.address}
                    onChange={set("address")}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="Ex: Feira de Santana"
                      value={formData.city}
                      onChange={set("city")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      placeholder="Ex: BA"
                      value={formData.state}
                      onChange={set("state")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    placeholder="Ex: 44085-370"
                    value={formData.zip_code}
                    onChange={set("zip_code")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone(s) de Contato</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: (75) 99939-3940"
                    value={formData.phone}
                    onChange={set("phone")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece nos e-mails de confirmação para que o paciente possa cancelar se necessário.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail da Clínica</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    className="bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    E-mail fixo da clínica para recebimento de notificações de agendamento.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
                  <Textarea
                    id="opening_hours"
                    placeholder="Ex: Segunda a Sexta, 8h às 12h e 14h às 19h"
                    value={formData.opening_hours}
                    onChange={set("opening_hours")}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map_url">URL do Mapa (Google Maps embed)</Label>
                  <Input
                    id="map_url"
                    placeholder="https://www.google.com/maps/embed?..."
                    value={formData.map_url}
                    onChange={set("map_url")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-primary to-azul-claro text-white font-semibold py-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Dados da Clínica"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
