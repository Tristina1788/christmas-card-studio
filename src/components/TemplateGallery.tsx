import { useState } from "react";
import type { Template } from "../config/templates";
function TemplateArtwork({ template: t }: { template: Template }) {
  const [failed, setFailed] = useState(false);
  if (t.status === "awaiting-artwork" || failed)
    return (
      <div className={`missing-art palette-${t.palette}`}>
        <span className="edition">THE CHRISTMAS COLLECTION</span>
        <span className="design-number">{t.id}</span>
        <span className="missing-caption">
          {failed ? "Artwork unavailable" : "Awaiting original artwork"}
        </span>
        <span className="missing-detail">
          {failed
            ? "Please check this image file."
            : "Your original design belongs here."}
        </span>
      </div>
    );
  return (
    <img
      className="template-image"
      src={t.background}
      alt={`${t.name} original card artwork`}
      onError={() => setFailed(true)}
    />
  );
}
export function TemplateGallery({
  templates,
  onSelect,
}: {
  templates: Template[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          <span /> A LITTLE PAPER. A LOT OF LOVE. <span />
        </div>
        <h1>
          Make Christmas
          <br />
          memories <em>beautiful.</em>
        </h1>
        <p>
          A favorite photo. A few words from the heart.
          <br />A keepsake they’ll treasure long after the holidays.
        </p>
        <a className="button" href="#collection">
          Find your Christmas card <span aria-hidden="true">→</span>
        </a>
        <div className="hero-note">
          Made yours, in minutes · Printable 5 × 7 inch cards
        </div>
      </section>
      <section className="how-it-works" aria-label="How it works">
        {[
          ["01", "Find your favorite", "A design for your kind of Christmas."],
          ["02", "Make it personal", "Your photo. Your family. Your story."],
          ["03", "Print a little joy", "Download a beautiful PNG or PDF."],
        ].map(([n, title, detail]) => (
          <div key={n}>
            <span>{n}</span>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="collection" id="collection">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THOUGHTFULLY MADE, JOYFULLY SENT</div>
            <h2>The Christmas collection</h2>
          </div>
          <span className="collection-count">
            10 designs · one lovely tradition
          </span>
        </div>
        {templates.some((t) => t.status !== "approved") && (
          <div className="notice">
            <span aria-hidden="true">✧</span>
            <div>
              <strong>The collection is being prepared.</strong>
              <p>
                Original artwork and print areas are awaiting review. You can
                explore the editor; downloads open when a design is approved.
              </p>
            </div>
          </div>
        )}
        <div className="template-grid">
          {templates.map((t) => (
            <article
              className="template-card"
              key={t.id}
              data-testid={`template-${t.id}`}
            >
              <div className="artwork-wrap">
                <TemplateArtwork template={t} />
                <span className="template-format">5 × 7 IN</span>
              </div>
              <div className="template-card-info">
                <span className="tiny-label">
                  DESIGN {t.id}{" "}
                  {t.status === "approved" ? "· READY TO PERSONALIZE" : ""}
                </span>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <button
                  className="text-button"
                  onClick={() => onSelect(t.id)}
                  aria-label={`Personalize ${t.name}`}
                >
                  Personalize This Card <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="closing-note">
        <span aria-hidden="true">✧</span>
        <h2>A keepsake, made by you.</h2>
        <p>
          Print at home or at your favorite print shop.
          <br />
          Your photos stay on your device, always.
        </p>
        <div className="small-caps">
          NO ACCOUNTS · NO PHOTO UPLOADS TO A SERVER · JUST CHRISTMAS JOY
        </div>
      </section>
    </>
  );
}
