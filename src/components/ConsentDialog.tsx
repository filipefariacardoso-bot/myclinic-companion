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
              <h3 className="font-bold text-lg mb-2">Autorização para Acesso a Informações Médicas</h3>
              <p className="text-muted-foreground">
                Este documento tem por objetivo solicitar sua autorização para que o médico 
                responsável pelo atendimento na <strong>CuidarBem Pediatria</strong> possa ter 
                acesso às informações médicas que você forneceu através do cadastro e dos 
                questionários médicos preenchidos neste aplicativo.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">1. Dados Coletados</h3>
              <p className="text-muted-foreground">
                As informações incluem, mas não se limitam a:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1">
                <li>Nome completo e dados de contato</li>
                <li>Informações sobre a criança (nome, idade, sexo)</li>
                <li>Queixas médicas principais</li>
                <li>Histórico de saúde da criança</li>
                <li>Medicamentos em uso</li>
                <li>Informações sobre nascimento e gestação</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-2">2. Finalidade do Acesso</h3>
              <p className="text-muted-foreground">
                As informações serão utilizadas exclusivamente para:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1">
                <li>Preparação prévia do atendimento médico</li>
                <li>Melhor compreensão do quadro clínico da criança</li>
                <li>Otimização do tempo de consulta</li>
                <li>Registro adequado no prontuário médico</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-2">3. Confidencialidade e Sigilo</h3>
              <p className="text-muted-foreground">
                Todas as informações fornecidas são protegidas por sigilo médico conforme 
                estabelecido pelo <strong>Código de Ética Médica</strong> e pela 
                <strong> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
              </p>
              <p className="text-muted-foreground mt-2">
                Somente o médico responsável pelo seu atendimento e a equipe administrativa 
                autorizada terão acesso às suas informações.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">4. Direitos do Paciente</h3>
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1">
                <li>Solicitar a correção de dados incorretos</li>
                <li>Solicitar a exclusão de suas informações a qualquer momento</li>
                <li>Revogar este consentimento, impedindo novos acessos</li>
                <li>Obter informações sobre como seus dados são utilizados</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-2">5. Revogação do Consentimento</h3>
              <p className="text-muted-foreground">
                Este consentimento pode ser revogado a qualquer momento através de solicitação 
                direta à clínica ou pelo próprio aplicativo. A revogação não afeta o atendimento 
                médico, mas pode impactar a qualidade da preparação prévia do profissional.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-muted-foreground">
                <strong>Ao aceitar este termo, você declara:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1 mt-2">
                <li>Ter lido e compreendido todas as informações acima</li>
                <li>Concordar com o acesso do médico às suas informações médicas</li>
                <li>Estar ciente dos seus direitos e da finalidade do uso dos dados</li>
              </ul>
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