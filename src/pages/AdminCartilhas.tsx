import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Upload, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Cartilha {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function AdminCartilhas() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [cartilhas, setCartilhas] = useState<Cartilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadCartilhas();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const loadCartilhas = async () => {
    try {
      const { data, error } = await supabase
        .from("cartilhas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartilhas(data || []);
    } catch (error) {
      console.error("Erro ao carregar cartilhas:", error);
      toast.error("Erro ao carregar cartilhas");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo (PDFs, imagens, documentos)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não permitido. Use PDF, imagens ou documentos Word.");
        return;
      }

      // Validar tamanho (máximo 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Tamanho máximo: 20MB");
        return;
      }

      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.file) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);

    try {
      // Upload do arquivo para o storage
      const fileExt = formData.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cartilhas")
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from("cartilhas")
        .getPublicUrl(filePath);

      // Salvar metadados no banco
      const { error: insertError } = await supabase.from("cartilhas").insert({
        title: formData.title,
        description: formData.description || null,
        file_url: urlData.publicUrl,
        file_type: formData.file.type,
      });

      if (insertError) throw insertError;

      toast.success("Cartilha adicionada com sucesso!");
      setShowAddDialog(false);
      setFormData({ title: "", description: "", file: null });
      loadCartilhas();
    } catch (error) {
      console.error("Erro ao adicionar cartilha:", error);
      toast.error("Erro ao adicionar cartilha");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    try {
      // Extrair o nome do arquivo da URL
      const fileName = fileUrl.split("/").pop();
      
      if (fileName) {
        // Deletar arquivo do storage
        const { error: storageError } = await supabase.storage
          .from("cartilhas")
          .remove([fileName]);

        if (storageError) console.error("Erro ao deletar arquivo:", storageError);
      }

      // Deletar registro do banco
      const { error: dbError } = await supabase
        .from("cartilhas")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Cartilha removida com sucesso!");
      loadCartilhas();
    } catch (error) {
      console.error("Erro ao remover cartilha:", error);
      toast.error("Erro ao remover cartilha");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-rosa-bebe/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-azul-claro to-rosa-bebe p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Admin
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
                📚
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Gerenciar Cartilhas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Adicione, edite ou remova cartilhas
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Cartilha
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando cartilhas...</p>
          </div>
        ) : cartilhas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cartilha cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira cartilha
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Cartilha
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartilhas.map((cartilha) => (
              <Card
                key={cartilha.id}
                className="hover:shadow-lg transition-all border-2 border-azul-claro/30"
              >
                <CardHeader className="bg-azul-claro/20">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📄 {cartilha.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {cartilha.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {cartilha.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(cartilha.file_url, "_blank")}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => setDeleteId(cartilha.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {new Date(cartilha.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Cartilha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Guia de Vacinação Infantil"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição sobre o conteúdo da cartilha"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="file">Arquivo (PDF, Imagem ou Word) *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                required
              />
              {formData.file && (
                <p className="text-sm text-muted-foreground mt-2">
                  📎 {formData.file.name}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Enviando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta cartilha? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const cartilha = cartilhas.find((c) => c.id === deleteId);
                if (cartilha) handleDelete(cartilha.id, cartilha.file_url);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
