import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";

export function useBoot() {
  const init = useAppStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);
}
