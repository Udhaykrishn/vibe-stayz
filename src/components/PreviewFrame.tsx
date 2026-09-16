"use client";
import { useRef, useState } from "react";
import Icon from "./Icon";
export interface PreviewTarget {
  label: string;
  path: string;
  group: string;
  /** Shown beside the address bar, e.g. "Draft" or "Scheduled". */
  status?: string;
  /** True when this page is not live for guests yet. */
  draft?: boolean;
}
/** Widths worth checking before publishing: a phone, a tablet, and the room you have. */
const DEVICES = [
  ["mobile", "Mobile", "mobile", 390],
  ["tablet", "Tablet", "tablet", 834],
  ["desktop", "Desktop", "monitor", 0],
] as const;
/** Every frame load goes through the entry route, which keeps preview switched on. */
const entry = (path: string) =>
  `/api/admin/preview?path=${encodeURIComponent(path)}`;
export default function PreviewFrame({
  targets,
  initialPath,
}: {
  targets: PreviewTarget[];
  initialPath: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [path, setPath] = useState(initialPath);
  const [device, setDevice] = useState<string>("desktop");
  const [viewing, setViewing] = useState(initialPath);
  const groups = [...new Set(targets.map((t) => t.group))];
  const selected = targets.find((t) => t.path === path);
  const width = DEVICES.find(([key]) => key === device)?.[3] || 0;
  // The frame is same-origin, so we can follow the editor as they click through the site.
  const track = () => {
    try {
      const url = frame.current?.contentWindow?.location;
      if (url?.pathname) setViewing(url.pathname + url.search);
    } catch {}
  };
  const reload = () => {
    try {
      frame.current?.contentWindow?.location.reload();
    } catch {
      if (frame.current) frame.current.src = entry(path);
    }
  };
  return (
    <section className="admin-panel preview-panel">
      <div className="preview-toolbar">
        <label className="preview-picker">
          <span className="sr-only">Page to preview</span>
          <select
            value={path}
            onChange={(event) => {
              setPath(event.target.value);
              setViewing(event.target.value);
            }}
          >
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {targets
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <option key={t.path} value={t.path}>
                      {t.label}
                      {t.status ? ` · ${t.status}` : ""}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="preview-devices" role="group" aria-label="Preview width">
          {DEVICES.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={device === key ? "active" : undefined}
              aria-pressed={device === key}
              onClick={() => setDevice(key)}
            >
              <Icon name={icon} size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="preview-reload" onClick={reload}>
          <Icon name="refresh" size={16} />
          <span>Refresh</span>
        </button>
        <a
          className="button button-outline"
          href={entry(path)}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="external" size={15} />
          Open in a tab
        </a>
      </div>
      <div className="preview-address">
        <Icon name="eye" size={14} />
        <code>{viewing}</code>
        {selected?.status && (
          <span
            className={`status-pill ${selected.draft ? "draft" : "published"}`}
          >
            {selected.status}
          </span>
        )}
      </div>
      <div className={`preview-stage device-${device}`}>
        <iframe
          ref={frame}
          key={path}
          src={entry(path)}
          title="Website preview"
          onLoad={track}
          style={width ? { width: `${width}px` } : undefined}
        />
      </div>
    </section>
  );
}
