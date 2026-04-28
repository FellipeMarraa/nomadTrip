import {Check, ChevronDown, Luggage, Plus, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import type {ChecklistItem} from "@/types";
import {ManageChecklistItemModal} from "@/components/features/ManageChecklistItemModal";
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible";
import {ScrollArea} from "@/components/ui/scroll-area";

interface ChecklistTabProps {
    checklist: ChecklistItem[];
    onToggleItem: (itemId: string, currentState: boolean) => void;
    onAddItem: (task: string, category: string) => Promise<void>;
    onDeleteItem: (itemId: string) => Promise<void>;
}

export function ChecklistTab({ checklist, onToggleItem, onAddItem, onDeleteItem }: ChecklistTabProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = Array.from(new Set(checklist?.map(item => item.category || "Geral")));

    return (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
            {/* HEADER FIXO */}
            <div className="flex items-center justify-between px-2 bg-background/95 backdrop-blur-sm sticky top-0 z-10 py-2">
                <div className="flex items-center gap-2">
                    <Luggage size={16} className="text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Bagagem ({checklist?.filter(i => i.completed).length}/{checklist?.length})
                    </h3>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 h-8 px-3 rounded-lg transition-all active:scale-95"
                >
                    <Plus size={14} className="mr-1" /> Add Item
                </Button>
            </div>

            {checklist?.length > 0 ? (
                <div className="space-y-3">
                    {categories.map(category => {
                        const categoryItems = checklist.filter(item => (item.category || "Geral") === category);
                        const completedCount = categoryItems.filter(i => i.completed).length;

                        return (
                            <Collapsible key={category} defaultOpen className="space-y-2">
                                <CollapsibleTrigger asChild>
                                    <button className="flex w-full items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-all group">
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
                                    <ScrollArea className={cn(
                                        "w-full rounded-2xl",
                                        categoryItems.length > 6 ? "h-[280px] border border-border/20 p-2" : "h-auto"
                                    )}>
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 p-1">
                                            {categoryItems.map((item) => (
                                                <div key={item.id} className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/30 hover:border-primary/40 transition-all">
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
                                                        "flex-1 text-[11px] font-bold uppercase tracking-tight truncate transition-all",
                                                        item.completed ? "line-through text-muted-foreground/60" : "text-foreground"
                                                    )}>
                                                        {item.task}
                                                    </p>

                                                    <button
                                                        onClick={() => onDeleteItem(item.id)}
                                                        className="h-7 w-7 flex items-center justify-center rounded-lg text-destructive/40 hover:text-destructive hover:bg-destructive/10 sm:opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-border/40 rounded-[32px] bg-muted/5">
                    <Luggage size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sua bagagem está vazia</p>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="link"
                        className="text-primary text-[10px] font-black uppercase mt-2"
                    >
                        Começar a listar
                    </Button>
                </div>
            )}

            <ManageChecklistItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onAddItem}
            />
        </div>
    );
}