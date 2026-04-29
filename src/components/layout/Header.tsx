import {useAuthStore} from "@/store/useAuthStore";
import {LayoutDashboard, LogOut, Menu, Plane} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
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
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">

                <div className="flex items-center gap-4">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent/40 text-muted-foreground transition-all active:scale-95">
                                    <Menu size={20} strokeWidth={1.5} />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex w-[280px] flex-col border-r border-border/20 bg-background p-0">

                                <SheetHeader className="p-6 pb-2 text-left">
                                    <SheetTitle className="flex items-center gap-2 text-lg font-medium tracking-tight">
                                        <Plane className="text-primary" size={20} strokeWidth={1.5} />
                                        NomadTravel
                                    </SheetTitle>
                                </SheetHeader>

                                <nav className="flex-1 space-y-1 px-4 py-4">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary/5 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                                )}
                                            >
                                                <item.icon size={18} strokeWidth={ isActive ? 2 : 1.5} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <SheetFooter className="mt-auto border-t border-border/10 p-6 bg-muted/5">
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border/40">
                                                <AvatarImage src={user?.photoURL} />
                                                <AvatarFallback className="text-xs font-medium">
                                                    {user?.displayName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none text-foreground">
                                                    {user?.displayName?.split(' ')[0]}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                                                    {user?.role}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-destructive/70 hover:text-destructive transition-colors"
                                        >
                                            <LogOut size={12} strokeWidth={2} /> Encerrar
                                        </button>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary md:flex">
                            <Plane size={18} strokeWidth={2} />
                        </div>
                        <span className="text-lg font-medium tracking-tight text-foreground">
                            NomadTravel
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 md:flex">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm transition-all rounded-full",
                                    isActive
                                        ? "text-primary bg-primary/5 font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/*<button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors">*/}
                    {/*    <Bell size={18} strokeWidth={1.5} />*/}
                    {/*</button>*/}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="outline-none">
                                <Avatar className="h-8 w-8 border border-border/40 transition-transform active:scale-95">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                                        {user?.displayName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 mt-3 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/5">
                            <DropdownMenuLabel className="font-normal py-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{user?.role}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/10" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="cursor-pointer gap-2 rounded-xl m-1.5 text-destructive/80 focus:bg-destructive/5 focus:text-destructive text-xs font-medium uppercase tracking-widest"
                            >
                                <LogOut size={14} strokeWidth={2} /> Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}