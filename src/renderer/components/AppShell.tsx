import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../stores/appStore";

/** Redireciona para a welcome se não existir nenhuma biblioteca. */
export function RequireLibraries() {
  const count = useAppStore((state) => state.snapshot.libraries.length);
  if (count === 0) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
