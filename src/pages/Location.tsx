import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Navigation, MessageCircle, Instagram } from "lucide-react";
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
  instagram: string | null;
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
            {/* Mapa da Localização */}
            <Card className="border-2 border-amarelo-suave/30 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amarelo-suave/20 to-rosa-bebe/20">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  Como Chegar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.4!2d-38.9667!3d-12.2667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDE2JzAwLjEiUyAzOMKwNTgnMDAuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Clínica CuidarBem Pediatria"
                  />
                </div>
                <div className="p-6 bg-gradient-to-br from-background to-amarelo-suave/5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address + ", " + location.city + " - " + location.state)}`, "_blank")}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Traçar Rota
                    </Button>
                    <Button
                      onClick={() => window.open(location.map_url || `https://maps.google.com/?q=${encodeURIComponent(location.address + ", " + location.city + " - " + location.state)}`, "_blank")}
                      variant="outline"
                      className="flex-1"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Abrir no Google Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Contato e Endereço */}
            <Card className="border-2 border-rosa-bebe/30">
              <CardHeader className="bg-gradient-to-r from-rosa-bebe/20 to-amarelo-suave/20">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-6 h-6 text-primary" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Endereço */}
                <div className="space-y-3 p-4 bg-amarelo-suave/10 rounded-xl">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Endereço Completo
                  </h3>
                  <div className="space-y-1 text-muted-foreground pl-7">
                    <p className="font-medium text-foreground">{location.name}</p>
                    <p>{location.address}</p>
                    <p>
                      {location.city} - {location.state}
                      {location.zip_code && ` | CEP: ${location.zip_code}`}
                    </p>
                  </div>
                </div>

                {/* Horário de Funcionamento */}
                {location.opening_hours && (
                  <div className="space-y-3 p-4 bg-rosa-bebe/10 rounded-xl">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Horário de Funcionamento
                    </h3>
                    <div className="text-muted-foreground pl-7 space-y-1">
                      {location.opening_hours.split("|").map((line, idx) => (
                        <p key={idx}>{line.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contatos */}
                <div className="space-y-3 p-4 bg-azul-claro/10 rounded-xl">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Fale Conosco
                  </h3>
                  <div className="space-y-3 pl-7">
                    {location.phone && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={`tel:${location.phone.replace(/\D/g, '')}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-5 h-5 flex-shrink-0" />
                          <span>{location.phone}</span>
                        </a>
                        <Button
                          onClick={() => window.open(`https://wa.me/55${location.phone.replace(/\D/g, '')}`, "_blank")}
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 w-fit"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    )}
                    {location.email && (
                      <a
                        href={`mailto:${location.email}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <span>{location.email}</span>
                      </a>
                    )}
                    {location.instagram && (
                      <a
                        href={`https://instagram.com/${location.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="w-5 h-5 flex-shrink-0" />
                        <span>{location.instagram}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Informações de Pagamento PIX */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                  <h3 className="font-semibold text-lg">💳 Pagamento PIX</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Chave PIX:</span>
                      <code className="bg-background/50 px-2 py-1 rounded">068.695.456-42</code>
                    </p>
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg">
                      ✨ Pagamento via PIX tem 5% de desconto!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
