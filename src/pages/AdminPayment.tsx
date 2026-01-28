import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Edit2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentInfo {
  id: string;
  title: string;
  description: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  bank_info: string | null;
  instructions: string | null;
  is_active: boolean;
}

export default function AdminPayment() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pix_key: "",
    pix_key_type: "",
    bank_info: "",
    instructions: "",
    is_active: true,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadPaymentInfos();
  }, [isAdmin, navigate]);

  const loadPaymentInfos = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_info")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentInfos(data || []);
    } catch (error) {
      console.error("Erro ao carregar informações:", error);
      toast.error("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("payment_info")
          .update({
            title: formData.title,
            description: formData.description || null,
            pix_key: formData.pix_key || null,
            pix_key_type: formData.pix_key_type || null,
            bank_info: formData.bank_info || null,
            instructions: formData.instructions || null,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Informação atualizada!");
      } else {
        const { error } = await supabase.from("payment_info").insert({
          title: formData.title,
          description: formData.description || null,
          pix_key: formData.pix_key || null,
          pix_key_type: formData.pix_key_type || null,
          bank_info: formData.bank_info || null,
          instructions: formData.instructions || null,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast.success("Informação adicionada!");
      }

      resetForm();
      loadPaymentInfos();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    }
  };

  const handleEdit = (info: PaymentInfo) => {
    setFormData({
      title: info.title,
      description: info.description || "",
      pix_key: info.pix_key || "",
      pix_key_type: info.pix_key_type || "",
      bank_info: info.bank_info || "",
      instructions: info.instructions || "",
      is_active: info.is_active,
    });
    setEditingId(info.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
      const { error } = await supabase.from("payment_info").delete().eq("id", id);
      if (error) throw error;
      toast.success("Excluído com sucesso!");
      loadPaymentInfos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      pix_key: "",
      pix_key_type: "",
      bank_info: "",
      instructions: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/20 to-azul-claro/20">
      <header className="bg-gradient-to-r from-verde-menta to-azul-claro p-6 rounded-b-3xl shadow-lg">
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
                💳
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gerenciar Pagamentos</h1>
                <p className="text-sm text-muted-foreground">Configure informações de pagamento</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Forma
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-2 border-verde-menta/30">
            <CardHeader>
              <CardTitle>{editingId ? "Editar" : "Nova Forma de Pagamento"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Título (ex: PIX, Transferência)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Input
                  placeholder="Chave PIX"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                />
                <Input
                  placeholder="Tipo da Chave (CPF, CNPJ, Email, Telefone)"
                  value={formData.pix_key_type}
                  onChange={(e) => setFormData({ ...formData, pix_key_type: e.target.value })}
                />
                <Textarea
                  placeholder="Dados Bancários"
                  value={formData.bank_info}
                  onChange={(e) => setFormData({ ...formData, bank_info: e.target.value })}
                />
                <Textarea
                  placeholder="Instruções"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-verde-menta to-azul-claro rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : paymentInfos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma forma de pagamento cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paymentInfos.map((info) => (
              <Card key={info.id} className={`border-2 ${info.is_active ? 'border-verde-menta/30' : 'border-muted opacity-60'}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{info.title}</h3>
                        {!info.is_active && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">Inativo</span>
                        )}
                      </div>
                      {info.description && <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>}
                      {info.pix_key && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">PIX:</span> {info.pix_key} ({info.pix_key_type})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(info)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(info.id)}>
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
