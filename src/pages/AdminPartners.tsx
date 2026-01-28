import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Edit2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  specialty: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export default function AdminPartners() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    description: "",
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadPartners();
  }, [isAdmin, navigate]);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("name");

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      toast.error("Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("partners")
          .update({
            name: formData.name,
            specialty: formData.specialty || null,
            description: formData.description || null,
            phone: formData.phone || null,
            email: formData.email || null,
            website: formData.website || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Parceiro atualizado!");
      } else {
        const { error } = await supabase.from("partners").insert({
          name: formData.name,
          specialty: formData.specialty || null,
          description: formData.description || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
        });

        if (error) throw error;
        toast.success("Parceiro adicionado!");
      }

      resetForm();
      loadPartners();
    } catch (error) {
      console.error("Erro ao salvar parceiro:", error);
      toast.error("Erro ao salvar parceiro");
    }
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      specialty: partner.specialty || "",
      description: partner.description || "",
      phone: partner.phone || "",
      email: partner.email || "",
      website: partner.website || "",
    });
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;

    try {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Parceiro excluído!");
      loadPartners();
    } catch (error) {
      console.error("Erro ao excluir parceiro:", error);
      toast.error("Erro ao excluir parceiro");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", specialty: "", description: "", phone: "", email: "", website: "" });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-laranja-suave/20 to-amarelo-suave/20">
      <header className="bg-gradient-to-r from-laranja-suave to-amarelo-suave p-6 rounded-b-3xl shadow-lg">
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
                🤝
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gerenciar Parceiros</h1>
                <p className="text-sm text-muted-foreground">Adicione e edite parceiros da clínica</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-2 border-laranja-suave/30">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Parceiro" : "Novo Parceiro"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Especialidade"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <Input
                  placeholder="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-laranja-suave to-amarelo-suave rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : partners.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum parceiro cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="border-2 border-laranja-suave/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      {partner.specialty && (
                        <span className="inline-block mt-1 px-2 py-1 bg-laranja-suave/20 text-laranja-suave text-xs rounded-full">
                          {partner.specialty}
                        </span>
                      )}
                      {partner.description && <p className="mt-2 text-sm">{partner.description}</p>}
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {partner.phone && <p>📞 {partner.phone}</p>}
                        {partner.email && <p>✉️ {partner.email}</p>}
                        {partner.website && <p>🌐 {partner.website}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(partner)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(partner.id)}>
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
