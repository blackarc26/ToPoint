import App from "@/components/App";
import { loadData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Page() {
  const initial = loadData();
  return <App initial={initial} />;
}
