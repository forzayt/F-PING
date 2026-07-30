import { useEffect, useState } from "react";
import { hydrate } from "@/lib/store";

export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrate();
    setReady(true);
  }, []);
  return ready;
}
