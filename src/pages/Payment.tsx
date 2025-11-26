import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Check } from "lucide-react";
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
}

export default function Payment() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentInfo();
  }, []);

  const loadPaymentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_info")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setPaymentInfo(data || []);
    } catch (error) {
      console.error("Erro ao carregar informações de pagamento:", error);
      toast.error("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success("Copiado!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/20 to-azul-claro/20">
      <header className="bg-gradient-to-r from-verde-menta to-azul-claro p-6 rounded-b-3xl shadow-lg">
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
              💳
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Informações de Pagamento</h1>
              <p className="text-sm text-muted-foreground">
                Formas de pagamento disponíveis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-verde-menta to-azul-claro rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : paymentInfo.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Informações de pagamento serão disponibilizadas em breve
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paymentInfo.map((info) => (
              <Card
                key={info.id}
                className="border-2 border-verde-menta/30"
              >
                <CardHeader className="bg-verde-menta/20">
                  <CardTitle className="flex items-center gap-2">
                    💰 {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {info.description && (
                    <p className="text-muted-foreground">{info.description}</p>
                  )}

                  {info.pix_key && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Chave PIX:</h3>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-sm">{info.pix_key}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(info.pix_key!, info.id)}
                        >
                          {copiedKey === info.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {info.pix_key_type && (
                        <p className="text-sm text-muted-foreground">
                          Tipo: {info.pix_key_type}
                        </p>
                      )}
                    </div>
                  )}

                  {info.bank_info && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Dados Bancários:</h3>
                      <pre className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                        {info.bank_info}
                      </pre>
                    </div>
                  )}

                  {info.instructions && (
                    <div className="space-y-2 pt-4 border-t">
                      <h3 className="font-semibold">Instruções:</h3>
                      <p className="text-sm text-muted-foreground">
                        {info.instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
