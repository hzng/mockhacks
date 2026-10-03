import { LocalFeatureEditor } from "@/main-page/frontend/LocalFeatureEditor";

export default function Feature2() {
  return (
    <main>
      <div className="page-heading"><h1>Feature 2</h1><p className="muted">Person B workspace</p></div>
      <LocalFeatureEditor storageKey="person-b-notes" />
    </main>
  );
}
