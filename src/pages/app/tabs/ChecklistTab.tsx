import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "@/types";

interface ChecklistTabProps {
    checklist: ChecklistItem[];
    onToggleItem: (itemId: string, currentState: boolean) => void;
}

export function ChecklistTab({ checklist, onToggleItem }: ChecklistTabProps) {
    return (
        <div className="mt-6">
            <div className="mb-6 flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bagagem</h3>
                <Button variant="ghost" size="sm" className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10">
                    <Plus size={14} className="mr-1" /> Add Item
                </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {checklist?.map((item) => (
                    <div key={item.id} className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/40 hover:border-primary/40 transition-all">
                        <div onClick={() => onToggleItem(item.id, item.completed)} className={cn("h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer", item.completed ? "bg-primary border-primary" : "border-border")}>
                            {item.completed && <Check size={12} className="text-primary-foreground" />}
                        </div>
                        <p className={cn("flex-1 text-xs font-bold truncate text-foreground", item.completed && "line-through text-muted-foreground")}>{item.task}</p>
                        <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive ml-auto transition-all">
                            <Trash2 size={12} />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}