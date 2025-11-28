import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

interface ConsentDialogProps {
  open: boolean;
  onConsentGiven: () => void;
}

export default function ConsentDialog({ open, onConsentGiven }: ConsentDialogProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!agreed) {
      toast({
        variant: "destructive",
        title: "Consentimento necessário",
        description: "Por favor, leia e aceite o termo de consentimento"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({ 
          consent_given: true,
          consent_date: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Consentimento registrado ✅",
        description: "Obrigado por autorizar o acesso às suas informações médicas"
      });

      onConsentGiven();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar consentimento",
        description: "Tente novamente"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Termo de Consentimento</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-bold text-lg mb-3 text-center">
                TERMO DE CONSENTIMENTO PARA USO DE INFORMAÇÕES DIGITAIS
              </h3>
              <p className="text-center font-semibold mb-2">
                Aplicativo CuidarBem — Lumi Clínica Pediátrica
              </p>
              <p className="text-muted-foreground text-justify">
                Nos termos da legislação brasileira vigente, especialmente da <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD)</strong> e do <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>, ao utilizar o aplicativo CuidarBem, da Lumi Clínica Pediátrica, o(a) responsável legal pelo paciente declara estar ciente e de acordo com as condições abaixo:
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">1. FINALIDADE DAS INFORMAÇÕES</h3>
              <p className="text-muted-foreground text-justify">
                As informações fornecidas no aplicativo, incluindo dados pessoais do responsável e da criança, assim como informações relacionadas à saúde do paciente, serão utilizadas exclusivamente para fins de atendimento clínico, acompanhamento médico e organização de prontuário eletrônico.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">2. SIGILO E CONFIDENCIALIDADE</h3>
              <p className="text-muted-foreground text-justify">
                A Lumi Clínica Pediátrica compromete-se a manter sigilo absoluto sobre todas as informações, utilizando os dados apenas no contexto do atendimento médico. Nenhuma informação será divulgada ou publicada sem autorização expressa do responsável.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">3. PROTEÇÃO DE DADOS</h3>
              <p className="text-muted-foreground text-justify">
                Os dados são armazenados em ambiente seguro, observando princípios de confidencialidade e integridade. A clínica não vende, cede ou comercializa informações pessoais.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">4. CONSENTIMENTO LIVRE E INFORMADO</h3>
              <p className="text-muted-foreground text-justify">
                Ao aceitar este termo, o(a) responsável autoriza o uso das informações para atendimento clínico e acompanhamento pediátrico.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">5. DIREITO À PRIVACIDADE</h3>
              <p className="text-muted-foreground text-justify">
                O responsável pode solicitar acesso, correção e, quando aplicável, exclusão dos dados, nos termos da legislação vigente.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">6. FUNDAMENTAÇÃO LEGAL</h3>
              <p className="text-muted-foreground mb-2">Baseado em:</p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1">
                <li>Lei Geral de Proteção de Dados – Lei nº 13.709/2018</li>
                <li>Marco Civil da Internet – Lei nº 12.965/2014</li>
                <li>Código de Ética Médica</li>
                <li>Estatuto da Criança e do Adolescente – Lei nº 8.069/1990</li>
              </ul>
            </section>

            <section className="pt-4 border-t">
              <h3 className="font-bold mb-2">7. DECLARAÇÃO FINAL</h3>
              <p className="text-muted-foreground text-justify">
                Ao aceitar este termo, o responsável declara que compreende e concorda com o tratamento das informações conforme descrito.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-2 mt-4">
          <Checkbox 
            id="consent" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <Label 
            htmlFor="consent" 
            className="text-sm font-medium leading-tight cursor-pointer"
          >
            Li e concordo com os termos acima. Autorizo o acesso do médico responsável 
            às minhas informações médicas e de meu(s) filho(s).
          </Label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!agreed || loading}
            className="w-full"
          >
            {loading ? "Registrando..." : "Aceitar e Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}