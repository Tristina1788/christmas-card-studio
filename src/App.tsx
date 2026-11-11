import { useEffect, useRef, useState } from "react";
import { loadTemplates, type Template } from "./config/templates";
import { TemplateGallery } from "./components/TemplateGallery";
import { CardEditor, type Session } from "./components/CardEditor";
export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [session, setSession] = useState<Session>({
    photos: {},
    crops: {},
    values: {},
  });
  const heading = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    loadTemplates()
      .then((t) => {
        if (active) setTemplates(t);
      })
      .catch(() => {
        if (active)
          setError(
            "We couldn’t load the collection. Please refresh, or contact the studio if the problem continues.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  function navigate(id: string | null) {
    setSelected(id);
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => heading.current?.focus());
  }
  const template = templates.find((t) => t.id === selected);
  return (
    <>
      <header className="site-header">
        <button
          className="brand"
          aria-label="Christmas Card Studio home"
          onClick={() => navigate(null)}
        >
          <span className="brand-mark" aria-hidden="true">
            ✧
          </span>
          <span>
            Christmas
            <br />
            <span className="brand-subtitle">CARD STUDIO</span>
          </span>
        </button>
        <div className="header-note">A little joy, beautifully yours.</div>
        <a
          className="header-link"
          href="#collection"
          onClick={(e) => {
            if (selected) {
              e.preventDefault();
              navigate(null);
            }
          }}
        >
          The collection <span aria-hidden="true">→</span>
        </a>
      </header>
      <div tabIndex={-1} ref={heading} className="page-focus" />
      {error ? (
        <main className="load-state">
          <h1>A little pause in the festivities.</h1>
          <p role="alert">{error}</p>
          <button className="button" onClick={() => location.reload()}>
            Try again
          </button>
        </main>
      ) : templates.length ? (
        template ? (
          <CardEditor
            key={template.id}
            template={template}
            session={session}
            onChange={setSession}
            onBack={() => navigate(null)}
          />
        ) : (
          <main>
            <TemplateGallery templates={templates} onSelect={navigate} />
          </main>
        )
      ) : (
        <main className="load-state" role="status">
          Opening the Christmas collection…
        </main>
      )}
      <footer className="site-footer">
        <span>Christmas Card Studio</span>
        <p>Made for the moments that matter.</p>
        <span>Thoughtfully personal. Always private.</span>
      </footer>
    </>
  );
}
