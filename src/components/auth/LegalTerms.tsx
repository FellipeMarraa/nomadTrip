import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalTermsProps {
    type: "terms" | "privacy";
    trigger: React.ReactNode;
}

export function LegalTerms({ type, trigger }: LegalTermsProps) {
    const isTerms = type === "terms";

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-[600px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isTerms ? "Termos de Uso" : "Política de Privacidade"}
                    </DialogTitle>
                    <DialogDescription>
                        Última atualização: Abril de 2026
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="mt-4 h-[60vh] pr-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {isTerms ? (
                        <div className="space-y-4">
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">1. Aceitação dos Termos</h4>
                                <p>Ao acessar o NomadTravel, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
                            </section>
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">2. Uso do Serviço</h4>
                                <p>Este aplicativo é para uso pessoal. A monetização e o uso de recursos PRO são vinculados à assinatura individual ou convites de membros PRO.</p>
                            </section>
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">3. Limitações de IA</h4>
                                <p>O uso da inteligência artificial para checklists é limitado a 3 consultas diárias por usuário Free para garantir a estabilidade do sistema.</p>
                            </section>
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">4. Compartilhamento de Viagens</h4>
                                <p>Ao convidar membros, você entende que eles terão acesso às informações financeiras e roteiros compartilhados daquela viagem específica.</p>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">1. Coleta de Dados</h4>
                                <p>Utilizamos a autenticação do Google para garantir a segurança da sua conta. Coletamos apenas seu nome, e-mail e foto de perfil pública.</p>
                            </section>
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">2. Armazenamento</h4>
                                <p>Seus dados de viagem e checklists são armazenados de forma segura no Firebase. Checklists individuais são privados e inacessíveis a outros usuários.</p>
                            </section>
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">3. Cookies e Rastreamento</h4>
                                <p>Utilizamos apenas cookies essenciais para manter sua sessão ativa e garantir que as configurações de tema e idioma sejam preservadas.</p>
                            </section>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}