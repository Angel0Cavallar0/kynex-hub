import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ClientRole = "admin";

const roleOrder: ClientRole[] = ["admin"];
const isRoleAllowed = (role: ClientRole, minRole: ClientRole) =>
  roleOrder.indexOf(role) >= roleOrder.indexOf(minRole);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: ClientRole | null;
  minAccessLevel: ClientRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<ClientRole | null>(null);
  const [minAccessLevel, setMinAccessLevel] = useState<ClientRole>("admin");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeRole = (value: string | null | undefined): ClientRole | null => {
    if (value === "admin") return "admin";
    return null;
  };

  const fetchUserRole = async (userId: string): Promise<ClientRole | null> => {
    const { data, error } = await supabase
      .from("client_user_role")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar role do cliente:", error);
      return null;
    }

    if (typeof data?.role !== "string") {
      return null;
    }

    return normalizeRole(data.role);
  };

  const fetchMinAccessLevel = async (): Promise<ClientRole> => {
    const { data, error } = await supabase
      .from("global_settings")
      .select("value")
      .eq("key", "client_min_access_level")
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar nível mínimo de acesso do cliente:", error);
      return "admin";
    }

    const normalizedValue = normalizeRole(typeof data?.value === "string" ? data.value : null);
    return normalizedValue ?? "admin";
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const [role, minLevel] = await Promise.all([
            fetchUserRole(session.user.id),
            fetchMinAccessLevel(),
          ]);

          setMinAccessLevel(minLevel);
          setUserRole(role);

          if (!role || !isRoleAllowed(role, minLevel)) {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRole(null);
            toast.error("Seu usuário não possui acesso ao portal.");
            navigate("/login");
          }
        } else {
          setUserRole(null);
          fetchMinAccessLevel().then(setMinAccessLevel);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([fetchUserRole(session.user.id), fetchMinAccessLevel()]).then(
          async ([role, minLevel]) => {
            setMinAccessLevel(minLevel);
            setUserRole(role);

            if (!role || !isRoleAllowed(role, minLevel)) {
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              setUserRole(null);
              toast.error("Seu usuário não possui acesso ao portal.");
              navigate("/login");
            }
          }
        );
      } else {
        fetchMinAccessLevel().then(setMinAccessLevel);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao fazer login: " + error.message);
        throw error;
      }

      if (data.user) {
        const [role, minLevel] = await Promise.all([
          fetchUserRole(data.user.id),
          fetchMinAccessLevel(),
        ]);

        setMinAccessLevel(minLevel);

        if (!role || !isRoleAllowed(role, minLevel)) {
          await supabase.auth.signOut();
          toast.error("Seu usuário não possui acesso ao portal.");
          return;
        }

        setUserRole(role);
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserRole(null);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, userRole, minAccessLevel, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
