import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FlaskConical, Calendar, Trash2, User, ExternalLink, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ExamResult {
  id: string;
  user_id: string;
  patient_name: string;
  exam_name: string;
  exam_date: string;
  notes: string | null;
  file_url: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export default function AdminExamResults() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [resultsRes, profilesRes] = await Promise.all([
        supabase.from("exam_results" as any).select("*").order("exam_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email, phone"),
      ]);
      if (resultsRes.error) throw resultsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      // Signed URLs for files
      const raw = (resultsRes.data as unknown as ExamResult[]) || [];
      const withUrls = await Promise.all(raw.map(async (r) => {
        if (!r.file_url) return r;
        const { data: signed } = await supabase.storage.from("exam-results").createSignedUrl(r.file_url, 3600);
        return { ...r, file_url: signed?.signedUrl ?? null };
      }));

      setResults(withUrls);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este resultado?")) return;
    try {
      const { error } = await supabase.from("exam_results" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluído!" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-verde-menta/10">
      <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🔬</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Resultados de Exames</h1>
              <p className="text-sm text-white/90">Selecione um paciente para ver ou adicionar resultados</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Card className="border-2 border-azul-claro/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-azul-claro" /> Pacientes
            </CardTitle>
            <Input
              placeholder="Buscar paciente por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum paciente encontrado.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProfiles.map(profile => {
                  const initials = profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  const count = results.filter(r => r.user_id === profile.id).length;
                  return (
                    <Card
                      key={profile.id}
                      className="border border-azul-claro/20 hover:border-azul-claro/60 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/admin/patient/${profile.id}?tab=exam-results`)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-azul-claro/20 text-azul-claro font-bold text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                          <p className="text-xs text-azul-claro mt-0.5">{count} resultado(s)</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-azul-claro/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-azul-claro" /> Todos os Resultados ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Nenhum resultado cadastrado ainda.</p>
            ) : (
              <div className="grid gap-3">
                {results.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-azul-claro/10 bg-azul-claro/5">
                    <div>
                      <p className="font-medium text-sm">{r.patient_name} — {r.exam_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(r.exam_date).toLocaleDateString("pt-BR")}
                      </p>
                      {r.notes && <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{r.notes}</p>}
                    </div>
                    <div className="flex gap-2 items-center">
                      {r.file_url && (
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/patient/${r.user_id}?tab=exam-results`)}>
                        Ver paciente
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
