import {useAuthStore} from "@/store/useAuthStore";
import {Bell, LayoutDashboard, LogOut, Menu, Plane} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Link, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";
import {useState} from "react";

export function Header() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        // { name: "Minhas Viagens", href: "/trips", icon: Map },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">

                <div className="flex items-center gap-4">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-foreground transition-all active:scale-90">
                                    <Menu size={20} />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex w-[280px] flex-col border-r border-border/40 bg-background p-0">

                                <SheetHeader className="p-6 pb-2 text-left">
                                    <SheetTitle className="flex items-center gap-2 text-xl font-black tracking-tighter">
                                        <Plane className="text-primary" size={24} fill="currentColor" />
                                        NomadTravel
                                    </SheetTitle>
                                </SheetHeader>

                                <nav className="flex-1 space-y-1 px-3 py-4">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                )}
                                            >
                                                <item.icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <SheetFooter className="mt-auto border-t border-border/40 p-6">
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarImage src={user?.photoURL} />
                                                <AvatarFallback className="text-xs">{user?.displayName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold leading-none">{user?.displayName?.split(' ')[0]}</span>
                                                <span className="text-[10px] uppercase tracking-wider text-primary font-black">Plano {user?.role}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-2 text-xs font-bold text-destructive hover:opacity-80 transition-opacity"
                                        >
                                            <LogOut size={14} /> Sair da conta
                                        </button>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo - Só aparece o texto no mobile para não brigar com o ícone do menu */}
                    <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 md:flex">
                            <Plane size={20} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">
              NomadTravel
            </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <span className="absolute inset-x-4 -bottom-[21px] h-0.5 bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                        <Bell size={20} />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="ml-1 outline-none">
                                <Avatar className="h-9 w-9 border-2 border-transparent transition-all hover:border-primary/50 active:scale-90">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {user?.displayName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none">{user?.displayName}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-primary">Membro {user?.role}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/*<DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg m-1">*/}
                            {/*    <Link to="/settings"><Settings size={16} /> Configurações</Link>*/}
                            {/*</DropdownMenuItem>*/}
                            {/*<DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg m-1">*/}
                            {/*    <Link to="/wallet"><CreditCard size={16} /> Faturamento</Link>*/}
                            {/*</DropdownMenuItem>*/}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="cursor-pointer gap-2 rounded-lg m-1 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <LogOut size={16} /> Encerrar Sessão
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}