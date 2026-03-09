import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Edit2, MapPin, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  map_url: string | null;
  is_active: boolean;
  instagram: string | null;
}

export default function AdminLocation() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    instagram: "",
    opening_hours: "",
    map_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadLocations();
  }, [isAdmin, navigate]);

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_location")
        .select("*")
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);
      toast.error("Erro ao carregar localizações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("clinic_location")
          .update({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code || null,
            phone: formData.phone || null,
            email: formData.email || null,
            instagram: formData.instagram || null,
            opening_hours: formData.opening_hours || null,
            map_url: formData.map_url || null,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Localização atualizada!");
      } else {
        const { error } = await supabase.from("clinic_location").insert({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          instagram: formData.instagram || null,
          opening_hours: formData.opening_hours || null,
          map_url: formData.map_url || null,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast.success("Localização adicionada!");
      }

      resetForm();
      loadLocations();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    }
  };

  const handleEdit = (location: ClinicLocation) => {
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zip_code: location.zip_code || "",
      phone: location.phone || "",
      email: location.email || "",
      instagram: location.instagram || "",
      opening_hours: location.opening_hours || "",
      map_url: location.map_url || "",
      is_active: location.is_active,
    });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
      const { error } = await supabase.from("clinic_location").delete().eq("id", id);
      if (error) throw error;
      toast.success("Excluído com sucesso!");
      loadLocations();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      phone: "",
      email: "",
      opening_hours: "",
      map_url: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-rosa-bebe/20">
      <header className="bg-gradient-to-r from-azul-claro to-rosa-bebe p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
                📍
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gerenciar Localização</h1>
                <p className="text-sm text-muted-foreground">Configure os endereços da clínica</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Localização
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-2 border-azul-claro/30">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Localização" : "Nova Localização"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Nome da Unidade"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Estado"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <Input
                  placeholder="CEP"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
                <Input
                  placeholder="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Textarea
                  placeholder="Horário de Funcionamento"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                />
                <Input
                  placeholder="URL do Mapa (Google Maps embed)"
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingId ? "Atualizar" : "Adicionar"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : locations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma localização cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {locations.map((location) => (
              <Card key={location.id} className={`border-2 ${location.is_active ? 'border-azul-claro/30' : 'border-muted opacity-60'}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{location.name}</h3>
                        {!location.is_active && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">Inativo</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm">
                        {location.address}, {location.city} - {location.state}
                        {location.zip_code && `, ${location.zip_code}`}
                      </p>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {location.phone && <p>📞 {location.phone}</p>}
                        {location.email && <p>✉️ {location.email}</p>}
                        {location.opening_hours && <p>🕐 {location.opening_hours}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(location)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(location.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
