import { useEffect } from "react";
import { getClients } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function usePreload() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      getClients(user.id).catch(() => {});
    }
  }, [user?.id]);
}
