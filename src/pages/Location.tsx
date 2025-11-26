import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
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
}

export default function Location() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<ClinicLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_location")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      setLocation(data);
    } catch (error) {
      console.error("Erro ao carregar localização:", error);
      toast.error("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amarelo-suave/20 to-rosa-bebe/20">
      <header className="bg-gradient-to-r from-amarelo-suave to-rosa-bebe p-6 rounded-b-3xl shadow-lg">
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
              📍
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nossa Localização</h1>
              <p className="text-sm text-muted-foreground">
                Como chegar até nós
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amarelo-suave to-rosa-bebe rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : !location ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Informações de localização serão disponibilizadas em breve
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-2 border-amarelo-suave/30">
              <CardHeader className="bg-amarelo-suave/20">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  {location.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Endereço:</h3>
                  <p className="text-muted-foreground">
                    {location.address}
                  </p>
                  <p className="text-muted-foreground">
                    {location.city} - {location.state}
                    {location.zip_code && ` | CEP: ${location.zip_code}`}
                  </p>
                </div>

                {location.opening_hours && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horário de Funcionamento:
                    </h3>
                    <pre className="text-muted-foreground whitespace-pre-wrap">
                      {location.opening_hours}
                    </pre>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Contato:</h3>
                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="w-5 h-5" />
                      {location.phone}
                    </a>
                  )}
                  {location.email && (
                    <a
                      href={`mailto:${location.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="w-5 h-5" />
                      {location.email}
                    </a>
                  )}
                </div>

                {location.map_url && (
                  <div className="pt-4">
                    <Button
                      onClick={() => window.open(location.map_url!, "_blank")}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Abrir no Google Maps
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
