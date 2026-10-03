import { LocalFeatureEditor } from "@/main-page/frontend/LocalFeatureEditor";

export default function Feature1() {
  return (
    <main>
      <div className="page-heading"><h1>Feature 1</h1><p className="muted">Person A workspace</p></div>
      <LocalFeatureEditor storageKey="person-a-notes" />
    </main>
  );
}
