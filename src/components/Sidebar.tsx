import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderKanban,
  Settings,
  LogOut,
  CheckSquare,
  Folder,
  List,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const { signOut } = useAuth();
  const { logoUrl } = useTheme();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/clientes", label: "Clientes", icon: Users },
    { path: "/colaboradores", label: "Colaboradores", icon: UserCog },
  ];

  const clickupItems = [
    { path: "/clickup/responsaveis", label: "Responsáveis", icon: UserCheck },
    { path: "/clickup/tarefas", label: "Tarefas", icon: CheckSquare },
    { path: "/clickup/pastas", label: "Pastas", icon: Folder },
    { path: "/clickup/listas", label: "Listas", icon: List },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        {logoUrl ? (
          <img src={logoUrl} alt="Leon Manager" className="h-10 w-auto" />
        ) : (
          <h1 className="text-xl font-bold text-sidebar-foreground">Leon Manager</h1>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            <FolderKanban className="h-4 w-4" />
            ClickUp
          </div>
          {clickupItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 pl-9 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Configurações
        </NavLink>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};
