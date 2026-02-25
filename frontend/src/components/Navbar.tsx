import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Menu,
    X,
    LayoutDashboard,
    Dumbbell,
    Lightbulb,
    User,
    LogOut,
    CheckCircle,
    Trophy
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api, { Notification } from '@/lib/api';

const Navbar = () => {
    const { logout } = useAppState();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await api.notifications.list();
                setNotifications(data);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.notifications.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Log Workout', path: '/workout', icon: Dumbbell },
        { name: 'AI Suggestions', path: '/suggestions', icon: Lightbulb },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Dumbbell className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="hidden font-display text-xl font-bold tracking-tight text-foreground sm:inline-block">
                        IRON<span className="text-primary">PULSE</span>
                    </span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex md:items-center md:gap-1 lg:gap-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px] p-0">
                            <DropdownMenuLabel className="p-4 border-b">Notifications</DropdownMenuLabel>
                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`flex flex-col gap-1 border-b p-4 transition-colors hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''
                                                }`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    {n.type === 'badge' ? (
                                                        <Trophy className="h-4 w-4 text-amber-500" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-primary" />
                                                    )}
                                                    <span className="text-sm font-semibold">{n.title}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="border-b border-border bg-background p-4 md:hidden">
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                    } rounded-lg`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                        <Button
                            variant="outline"
                            className="mt-4 w-full justify-start gap-3"
                            onClick={logout}
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
