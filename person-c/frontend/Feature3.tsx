import { LocalFeatureEditor } from "@/main-page/frontend/LocalFeatureEditor";

export default function Feature3() {
  return (
    <main>
      <div className="page-heading"><h1>Feature 3</h1><p className="muted">Person C workspace</p></div>
      <LocalFeatureEditor storageKey="person-c-notes" />
    </main>
  );
}
