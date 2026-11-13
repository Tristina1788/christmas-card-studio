import { useEffect, useRef, useState } from "react";
import { loadArtwork, loadImage } from "../rendering/assets";
import { renderCard, prepareFonts } from "../rendering/cardRenderer";
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
  // Unverified flattened artwork can contain a baked-in sample portrait.
  // Do not composite another gallery photo until the artwork is separated
  // into a clean background and foreground frame overlay.
  return t.galleryPhoto && t.status === "approved" ? (
    <GalleryCard template={t} onFailure={() => setFailed(true)} />
  ) : (
    <img
      className="template-image"
      src={t.background}
      alt={`${t.name} original card artwork`}
      onError={() => setFailed(true)}
    />
  );
}
function GalleryCard({
  template,
  onFailure,
}: {
  template: Template;
  onFailure: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const failure = useRef(onFailure);
  useEffect(() => {
    let active = true;
    let photo: ImageBitmap | undefined;
    const target = canvas.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        Promise.all([
          loadArtwork(template),
          loadImage(template.galleryPhoto!),
          prepareFonts(template),
        ])
          .then(async ([artwork, image]) => {
            photo = await createImageBitmap(image);
            if (!active) {
              photo.close();
              return;
            }
            const full = document.createElement("canvas");
            renderCard(full, {
              template,
              artwork,
              photos: Object.fromEntries(
                template.photoSlots.map((slot) => [slot.id, photo]),
              ),
              crops: Object.fromEntries(
                template.photoSlots.map((slot) => [
                  slot.id,
                  { zoom: 1, x: 0, y: 0.25 },
                ]),
              ),
              values: {},
            });
            const ctx = target.getContext("2d");
            if (!ctx) throw new Error("Preview unavailable");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(full, 0, 0, target.width, target.height);
            target.dataset.rendered = "true";
            full.width = 1;
            full.height = 1;
            photo.close();
          })
          .catch(() => {
            if (active) failure.current();
          });
      },
      { rootMargin: "300px" },
    );
    observer.observe(target);
    return () => {
      active = false;
      observer.disconnect();
      photo?.close();
    };
  }, [template]);
  return (
    <>
      <canvas
        className="template-image"
        ref={canvas}
        width={600}
        height={840}
        role="img"
        aria-label={`${template.name} card with an illustrative sample family photo`}
      />
      <span className="sample-photo-label">Illustrative sample photo</span>
    </>
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
          Made yours, in minutes · Two-sided 5 × 7 inch cards
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
            {templates.length} designs · one lovely tradition
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
          {[...templates]
            .sort(
              (a, b) =>
                Number(b.featured ?? false) - Number(a.featured ?? false),
            )
            .map((t) => (
              <article
                className="template-card"
                key={t.id}
                data-testid={`template-${t.id}`}
              >
                <div className="artwork-wrap">
                  <TemplateArtwork template={t} />
                  <span className="template-format">5 × 7 IN · 2 SIDES</span>
                </div>
                <div className="template-card-info">
                  <span className="tiny-label">
                    {t.featured ? "NEW · " : ""}DESIGN {t.id}{" "}
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
