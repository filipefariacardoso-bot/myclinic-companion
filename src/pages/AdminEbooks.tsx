import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Edit2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ebook {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  author: string | null;
  category: string | null;
}

export default function AdminEbooks() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    author: "",
    category: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadEbooks();
  }, [isAdmin, navigate]);

  const loadEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error("Erro ao carregar e-books:", error);
      toast.error("Erro ao carregar e-books");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("ebooks")
          .update({
            title: formData.title,
            description: formData.description || null,
            file_url: formData.file_url,
            author: formData.author || null,
            category: formData.category || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("E-book atualizado!");
      } else {
        const { error } = await supabase.from("ebooks").insert({
          title: formData.title,
          description: formData.description || null,
          file_url: formData.file_url,
          author: formData.author || null,
          category: formData.category || null,
        });

        if (error) throw error;
        toast.success("E-book adicionado!");
      }

      resetForm();
      loadEbooks();
    } catch (error) {
      console.error("Erro ao salvar e-book:", error);
      toast.error("Erro ao salvar e-book");
    }
  };

  const handleEdit = (ebook: Ebook) => {
    setFormData({
      title: ebook.title,
      description: ebook.description || "",
      file_url: ebook.file_url,
      author: ebook.author || "",
      category: ebook.category || "",
    });
    setEditingId(ebook.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este e-book?")) return;

    try {
      const { error } = await supabase.from("ebooks").delete().eq("id", id);
      if (error) throw error;
      toast.success("E-book excluído!");
      loadEbooks();
    } catch (error) {
      console.error("Erro ao excluir e-book:", error);
      toast.error("Erro ao excluir e-book");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", file_url: "", author: "", category: "" });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-roxo-suave/20 to-azul-claro/20">
      <header className="bg-gradient-to-r from-roxo-suave to-azul-claro p-6 rounded-b-3xl shadow-lg">
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
                📖
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar E-books</h1>
                <p className="text-sm text-white/90">Adicione e edite materiais educativos</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-white text-roxo-suave hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo E-book
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-2 border-roxo-suave/30">
            <CardHeader>
              <CardTitle>{editingId ? "Editar E-book" : "Novo E-book"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Título"
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
                  placeholder="URL do arquivo (PDF ou Markdown)"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  required
                />
                <Input
                  placeholder="Autor"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
                <Input
                  placeholder="Categoria"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-roxo-suave to-azul-claro rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum e-book cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ebooks.map((ebook) => (
              <Card key={ebook.id} className="border-2 border-roxo-suave/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{ebook.title}</h3>
                      {ebook.author && <p className="text-sm text-muted-foreground">Por: {ebook.author}</p>}
                      {ebook.category && (
                        <span className="inline-block mt-1 px-2 py-1 bg-roxo-suave/20 text-roxo-suave text-xs rounded-full">
                          {ebook.category}
                        </span>
                      )}
                      {ebook.description && <p className="mt-2 text-sm">{ebook.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(ebook)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(ebook.id)}>
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
