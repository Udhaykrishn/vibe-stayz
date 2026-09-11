import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import { Field, MediaPicker } from "@/components/AdminFields";
import { cms } from "@/lib/cms-config";
import { isEntity, recordById, siteData } from "@/services/data";
type Props = {
  params: Promise<{ entity: string; id: string }>;
  searchParams: Promise<{ saved?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { entity, id } = await params;
  return {
    title: `${id === "new" ? "Add" : "Edit"} ${cms[entity]?.singular || "content"}`,
  };
}
export default async function Editor({ params, searchParams }: Props) {
  const { entity, id } = await params;
  if (!cms[entity] || !isEntity(entity)) notFound();
  const config = cms[entity];
  const isNew = id === "new";
  if (isNew && ["site_settings", "page_content"].includes(entity))
    redirect(`/admin/${entity}`);
  const data = await siteData(true);
  let record: Record<string, unknown> = {
    published: 0,
    featured: 0,
    active: 1,
    max_guests: 2,
    rating: 5,
    display_order: 0,
    property_type: "Private villa",
    price_label: "/ night onwards",
    check_in: "2:00 PM",
    check_out: "11:00 AM",
    pricing_disclaimer:
      "Prices are indicative and may vary. Contact us on WhatsApp for current pricing and stay details.",
    cta_label: "Explore this escape",
    cta_type: "resort",
    icon: "leaf",
    category: "Essentials",
    in_header: 1,
    in_footer: 1,
  };
  if (!isNew) {
    record = (await recordById<Record<string, unknown>>(entity, id)) || {};
    if (!record.id) notFound();
  }
  const resort =
    entity === "resorts"
      ? data.resorts.find((r) => r.id === record.id)
      : undefined;
  if (resort) {
    record.highlights = resort.highlights.join("\n");
    record.rules = resort.rules.join("\n");
  }
  const offer =
    entity === "offers"
      ? data.offers.find((o) => o.id === record.id)
      : undefined;
  const title =
    entity === "site_settings"
      ? "Website settings"
      : `${isNew ? "Add" : "Edit"} ${config.singular.toLowerCase()}`;
  const search = await searchParams;
  return (
    <AdminLayout
      title={title}
      description={
        isNew
          ? "Make a new addition to your collection."
          : String(
              record.name || record.title || record.label || config.description,
            )
      }
      actions={
        <a
          href={entity === "site_settings" ? "/admin" : `/admin/${entity}`}
          className="button button-outline"
        >
          Back
        </a>
      }
    >
      {search.saved && (
        <div className="success-note" role="status">
          Your changes have been saved and are ready on the website.
        </div>
      )}
      <form
        id="cms-editor"
        data-entity={entity}
        data-id={isNew ? "" : String(record.id)}
      >
        <div className="editor-layout">
          <nav className="editor-sections" aria-label="Editor sections">
            {config.groups.map((group, index) => (
              <a key={group.title} href={`#group-${index}`}>
                {group.title}
              </a>
            ))}
            {entity === "resorts" && (
              <>
                <a href="#gallery-editor">Gallery</a>
                <a href="#amenity-editor">Amenities</a>
              </>
            )}
          </nav>
          <div className="editor-content">
            {config.groups.map((group, index) => (
              <section
                key={group.title}
                className="admin-panel editor-group"
                id={`group-${index}`}
              >
                <h2>{group.title}</h2>
                <div className="form-grid">
                  {group.fields.map((field) => (
                    <Field
                      key={field.key}
                      field={field}
                      value={record[field.key]}
                      data={data}
                    />
                  ))}
                </div>
              </section>
            ))}
            {entity === "resorts" && (
              <>
                <section
                  className="admin-panel editor-group"
                  id="gallery-editor"
                >
                  <div className="panel-heading">
                    <div>
                      <h2>Property gallery</h2>
                      <p className="field-help">
                        Use the arrows to reorder images. Set your favourite as
                        the cover.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button button-outline"
                      data-add-gallery
                    >
                      <Icon name="plus" size={16} />
                      Add photo
                    </button>
                  </div>
                  <div id="gallery-rows">
                    {(resort?.gallery || []).map((img) => (
                      <div
                        key={img.id}
                        className="gallery-edit-row"
                        data-gallery-row
                        data-url={img.url}
                      >
                        <img
                          src={img.url}
                          alt="Gallery image preview"
                          width="110"
                          height="80"
                        />
                        <div>
                          <label>
                            Image description
                            <input
                              name="gallery_alt"
                              defaultValue={img.alt}
                              placeholder="Describe this photograph"
                            />
                          </label>
                          <div className="gallery-row-actions">
                            <button
                              type="button"
                              data-gallery-up
                              aria-label="Move image earlier"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              data-gallery-down
                              aria-label="Move image later"
                            >
                              ↓
                            </button>
                            <button type="button" data-gallery-cover>
                              Set as cover
                            </button>
                            <button type="button" data-gallery-remove>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p
                    id="gallery-empty"
                    className="field-help"
                    hidden={!!resort?.gallery.length}
                  >
                    No gallery images yet. Add your first photograph.
                  </p>
                </section>
                <section
                  className="admin-panel editor-group"
                  id="amenity-editor"
                >
                  <h2>Amenities at this stay</h2>
                  <div className="amenity-checkboxes">
                    {data.amenities.map((a) => (
                      <label key={a.id}>
                        <input
                          type="checkbox"
                          name="amenity_ids"
                          value={a.id}
                          defaultChecked={resort?.amenities.some(
                            (x) => x.id === a.id,
                          )}
                        />
                        <Icon name={a.icon} size={18} />
                        {a.name}
                      </label>
                    ))}
                  </div>
                </section>
              </>
            )}
            {entity === "offers" && (
              <section className="admin-panel editor-group">
                <h2>Associated stays</h2>
                <p className="field-help">
                  The first associated stay is the destination of a “resort”
                  button.
                </p>
                <div className="amenity-checkboxes">
                  {data.resorts.map((r) => (
                    <label key={r.id}>
                      <input
                        type="checkbox"
                        name="resort_ids"
                        value={r.id}
                        defaultChecked={offer?.resorts.some(
                          (x) => x.id === r.id,
                        )}
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              </section>
            )}
            <div id="save-error" className="error-note" role="alert" hidden />
            <div className="editor-savebar">
              <span>Changes appear after you save.</span>
              {!isNew &&
                !["site_settings", "page_content"].includes(entity) && (
                  <button
                    type="button"
                    className="danger-button"
                    data-delete-record
                  >
                    {["resorts", "locations"].includes(entity)
                      ? "Archive"
                      : "Delete"}
                  </button>
                )}
              <button type="submit" className="button button-dark">
                <Icon name="check" size={18} />
                Save changes
              </button>
            </div>
          </div>
        </div>
      </form>
      <MediaPicker />
      <dialog
        id="delete-dialog"
        className="confirm-dialog"
        aria-labelledby="delete-title"
      >
        <h2 id="delete-title">
          {["resorts", "locations"].includes(entity)
            ? "Archive this item?"
            : "Delete this item?"}
        </h2>
        <p>
          {["resorts", "locations"].includes(entity)
            ? "It will be hidden from the public website. You can restore it from this editor."
            : "This removes the item and its associations. This action cannot be undone."}
        </p>
        <div>
          <button
            type="button"
            className="button button-outline"
            data-cancel-delete
            autoFocus
          >
            Keep item
          </button>
          <button
            type="button"
            className="button button-dark"
            data-confirm-delete
          >
            {["resorts", "locations"].includes(entity)
              ? "Archive item"
              : "Delete item"}
          </button>
        </div>
      </dialog>
    </AdminLayout>
  );
}
