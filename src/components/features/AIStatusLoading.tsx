import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIStatusLoading() {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { title: "Analisando destinos", desc: "Processando coordenadas e locais" },
        { title: "Otimizando rotas", desc: "Calculando melhores trajetos entre cidades" },
        { title: "Curadoria de atividades", desc: "Selecionando experiências exclusivas" },
        { title: "Montando checklist", desc: "Separando itens essenciais para o clima local" },
        { title: "Sincronizando dados", desc: "Finalizando seu roteiro premium" }
    ];

    useEffect(() => {
        // Timer para o progresso da barra (mais suave)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 0.5; // Incremento lento para parecer real
            });
        }, 150);

        // Timer para os textos (acompanha o progresso)
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-1000">
            {/* Ícone Central com Glow de IA */}
            <div className="relative mb-10">
                <div className="absolute inset-0 animate-pulse blur-2xl bg-primary/20 rounded-full" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-card border-2 border-primary/20 shadow-2xl shadow-primary/10">
                    <Sparkles className="text-primary animate-bounce" size={32} />
                </div>
            </div>

            {/* Container da Barra de Progresso */}
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-2">
                    <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status do Motor IA</p>
                            <h3 className="text-sm font-bold tracking-tight">{steps[currentStep].title}</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</span>
                    </div>

                    {/* Barra de Progresso Estilizada */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30 border border-border/20">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Lista de Passos Dinâmica */}
                <div className="grid gap-4 pt-4">
                    {steps.map((item, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-start gap-4 transition-all duration-700",
                                    isCurrent ? "translate-x-2 opacity-100" : isCompleted ? "opacity-40" : "opacity-10 blur-[1px]"
                                )}
                            >
                                <div className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    isCompleted ? "bg-emerald-500/20 border-emerald-500/50" : isCurrent ? "border-primary animate-pulse" : "border-muted"
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    ) : isCurrent ? (
                                        <CircleDashed size={12} className="text-primary animate-spin" />
                                    ) : (
                                        <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className={cn(
                                        "text-xs font-bold leading-none tracking-tight",
                                        isCurrent ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {item.title}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-[10px] text-muted-foreground leading-none animate-in fade-in slide-in-from-top-1">
                                            {item.desc}
                                        </p>
                                    )}
                                </div>

                                {isCurrent && <ArrowRight size={14} className="ml-auto text-primary animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="mt-12 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest italic">
                Aguardando resposta do servidor...
            </p>
        </div>
    );
}