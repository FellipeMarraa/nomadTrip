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

    const globalItems = checklist?.filter(item => !item.userId || item.userId === 'global') || [];
    const myItems = checklist?.filter(item => item.userId === user?.uid) || [];

    const renderChecklistGroup = (items: ChecklistItem[], type: 'global' | 'personal') => {
        const categories = Array.from(new Set(items.map(item => item.category || "Geral")));
        const canEdit = type === 'personal' || isOwner;

        if (items.length === 0) {
            return (
                <div className="py-20 text-center border border-dashed border-border/10 rounded-[32px] bg-muted/5 mt-4">
                    <Luggage size={32} strokeWidth={1} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                        {type === 'global' ? "Nenhum item coletivo" : "Bagagem vazia"}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-4">
                {categories.map(category => {
                    const categoryItems = items.filter(item => (item.category || "Geral") === category);
                    const completedCount = categoryItems.filter(i => i.completed).length;

                    return (
                        <Collapsible key={category} defaultOpen className="space-y-2">
                            <CollapsibleTrigger asChild>
                                <button className="flex w-full items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/5 hover:bg-muted/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">
                                            {category}
                                        </span>
                                        <span className="text-[9px] font-medium text-muted-foreground/50 bg-background/40 px-2.5 py-0.5 rounded-full border border-border/5">
                                            {completedCount} / {categoryItems.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground/40 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <div className="grid gap-2 sm:grid-cols-2 p-1">
                                    {categoryItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "group flex items-center gap-3 p-4 rounded-2xl border transition-all",
                                                item.completed
                                                    ? "bg-muted/5 border-transparent opacity-60"
                                                    : "bg-card/20 border-border/40 hover:border-primary/20"
                                            )}
                                        >
                                            <div
                                                onClick={() => onToggleItem(item.id, item.completed)}
                                                className={cn(
                                                    "h-5 w-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0",
                                                    item.completed
                                                        ? "bg-emerald-500/80 border-emerald-500/0 shadow-sm"
                                                        : "border-border/60 bg-background/40 hover:border-primary/50"
                                                )}
                                            >
                                                {item.completed && <Check size={12} strokeWidth={3} className="text-white" />}
                                            </div>

                                            <p className={cn(
                                                "flex-1 text-[11px] font-medium uppercase tracking-tight truncate",
                                                item.completed ? "line-through text-muted-foreground/40" : "text-foreground/80"
                                            )}>
                                                {item.task}
                                            </p>

                                            {canEdit && (
                                                <button
                                                    onClick={() => onDeleteItem(item.id)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-xl text-destructive/20 hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} strokeWidth={1.5} />
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
        <div className="mt-6 animate-in fade-in duration-700">
            <Tabs defaultValue="personal" className="w-full">
                <div className="flex items-center justify-between gap-4 mb-8 px-1">
                    <TabsList className="bg-muted/10 border-none p-1 h-11 rounded-2xl flex-1 max-w-[260px]">
                        <TabsTrigger value="global" className="flex-1 rounded-xl text-[9px] font-medium uppercase tracking-[0.15em] gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Globe size={12} strokeWidth={1.5} /> Global
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="flex-1 rounded-xl text-[9px] font-medium uppercase tracking-[0.15em] gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <User size={12} strokeWidth={1.5} /> Pessoal
                        </TabsTrigger>
                    </TabsList>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-medium uppercase tracking-[0.2em] h-11 px-6 rounded-2xl border-none shadow-none transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={1.5} className="mr-2" /> Novo
                    </Button>
                </div>

                <TabsContent value="global" className="outline-none focus:ring-0">
                    <div className="px-2 mb-1">
                        <p className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                            Itens compartilhados • {globalItems.length} no total
                        </p>
                    </div>
                    {renderChecklistGroup(globalItems, 'global')}
                </TabsContent>

                <TabsContent value="personal" className="outline-none focus:ring-0">
                    <div className="px-2 mb-1">
                        <p className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                            Sua organização privada • {myItems.length} no total
                        </p>
                    </div>
                    {renderChecklistGroup(myItems, 'personal')}
                </TabsContent>
            </Tabs>

            <ManageChecklistItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (task, category, isGlobalFromModal) => {
                    await onAddItem(task, category, isGlobalFromModal);
                }}
                isOwner={isOwner}
            />
        </div>
    );
}