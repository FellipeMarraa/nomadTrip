import {Check, ChevronDown, Globe, Luggage, Plus, Trash2, User} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import type {ChecklistItem} from "@/types";
import {ManageChecklistItemModal} from "@/components/features/ManageChecklistItemModal";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {useAuthStore} from "@/store/useAuthStore";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface ChecklistTabProps {
    checklist: ChecklistItem[];
    onToggleItem: (itemId: string, currentState: boolean) => void;
    onAddItem: (task: string, category: string, isGlobal?: boolean) => Promise<void>;
    onDeleteItem: (itemId: string) => Promise<void>;
    isOwner: boolean;
}

export function ChecklistTab({ checklist, onToggleItem, onAddItem, onDeleteItem, isOwner }: ChecklistTabProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuthStore();

    // Filtros de Itens
    // Global: Itens que não possuem userId ou possuem flag específica
    const globalItems = checklist?.filter(item => !item.userId || item.userId === 'global') || [];

    // Individual: Apenas itens criados pelo usuário logado
    const myItems = checklist?.filter(item => item.userId === user?.uid) || [];

    const renderChecklistGroup = (items: ChecklistItem[], type: 'global' | 'personal') => {
        const categories = Array.from(new Set(items.map(item => item.category || "Geral")));
        const canEdit = type === 'personal' || isOwner;

        if (items.length === 0) {
            return (
                <div className="py-16 text-center border border-dashed border-border/40 rounded-[32px] bg-muted/5 mt-4">
                    <Luggage size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {type === 'global' ? "Nenhum item global definido" : "Sua bagagem pessoal está vazia"}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-3 mt-4">
                {categories.map(category => {
                    const categoryItems = items.filter(item => (item.category || "Geral") === category);
                    const completedCount = categoryItems.filter(i => i.completed).length;

                    return (
                        <Collapsible key={category} defaultOpen className="space-y-2">
                            <CollapsibleTrigger asChild>
                                <button className="flex w-full items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                            {category}
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                                            {completedCount}/{categoryItems.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={14} className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <div className="grid gap-2 sm:grid-cols-2 p-1">
                                    {categoryItems.map((item) => (
                                        <div key={item.id} className="group flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-card/30 hover:border-primary/40 transition-all">
                                            <div
                                                onClick={() => onToggleItem(item.id, item.completed)}
                                                className={cn(
                                                    "h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0",
                                                    item.completed ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-border/60 hover:border-primary"
                                                )}
                                            >
                                                {item.completed && <Check size={14} strokeWidth={4} className="text-white" />}
                                            </div>

                                            <p className={cn(
                                                "flex-1 text-[11px] font-bold uppercase tracking-tight truncate",
                                                item.completed ? "line-through text-muted-foreground/60" : "text-foreground"
                                            )}>
                                                {item.task}
                                            </p>

                                            {canEdit && (
                                                <button
                                                    onClick={() => onDeleteItem(item.id)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="mt-6 animate-in fade-in duration-500">
            <Tabs defaultValue="personal" className="w-full">
                {/* SUB-TABS ESTILIZADAS */}
                <div className="flex items-center justify-between gap-4 mb-6 px-1">
                    <TabsList className="bg-muted/30 border border-border/40 p-1 h-10 rounded-xl flex-1 max-w-[280px]">
                        <TabsTrigger value="global" className="flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2">
                            <Globe size={12} /> Global
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2">
                            <User size={12} /> Pessoal
                        </TabsTrigger>
                    </TabsList>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <Plus size={14} className="mr-1" /> Item
                    </Button>
                </div>

                <TabsContent value="global" className="outline-none focus:ring-0">
                    <div className="px-1 mb-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Checklist coletivo da viagem • {globalItems.length} itens
                        </p>
                    </div>
                    {renderChecklistGroup(globalItems, 'global')}
                </TabsContent>

                <TabsContent value="personal" className="outline-none focus:ring-0">
                    <div className="px-1 mb-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Sua bagagem individual • {myItems.length} itens
                        </p>
                    </div>
                    {renderChecklistGroup(myItems, 'personal')}
                </TabsContent>
            </Tabs>

            <ManageChecklistItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (task, category) => {
                    const activeTab = document.querySelector('[data-state="active"][role="tab"]')?.getAttribute('value');
                    await onAddItem(task, category, activeTab === 'global');
                }}
                isOwner={isOwner}
            />
        </div>
    );
}