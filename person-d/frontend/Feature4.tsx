import { LocalFeatureEditor } from "@/main-page/frontend/LocalFeatureEditor";

export default function Feature4() {
  return (
    <main>
      <div className="page-heading"><h1>Feature 4</h1><p className="muted">Person D workspace</p></div>
      <LocalFeatureEditor storageKey="person-d-notes" />
    </main>
  );
}
