import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Mail, Phone, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  description: string | null;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  website: string | null;
}

export default function Partners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rosa-bebe/20 to-amarelo-suave/20">
      <header className="bg-gradient-to-r from-rosa-bebe to-amarelo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🤝
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nossos Parceiros</h1>
              <p className="text-sm text-muted-foreground">
                Profissionais e colaboradores da clínica
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rosa-bebe to-amarelo-suave rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : partners.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum parceiro cadastrado</h3>
              <p className="text-muted-foreground">
                Em breve teremos profissionais listados aqui
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="hover:shadow-lg transition-all border-2 border-rosa-bebe/30 hover:border-rosa-bebe"
              >
                <CardHeader className="bg-rosa-bebe/20">
                  {partner.image_url ? (
                    <img
                      src={partner.image_url}
                      alt={partner.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto bg-rosa-bebe rounded-full flex items-center justify-center text-4xl mb-3">
                      👤
                    </div>
                  )}
                  <CardTitle className="text-center">{partner.name}</CardTitle>
                  {partner.specialty && (
                    <p className="text-sm text-center text-muted-foreground">
                      {partner.specialty}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {partner.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {partner.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    {partner.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <Phone className="w-4 h-4" />
                        {partner.phone}
                      </a>
                    )}
                    {partner.email && (
                      <a
                        href={`mailto:${partner.email}`}
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <Mail className="w-4 h-4" />
                        {partner.email}
                      </a>
                    )}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
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
