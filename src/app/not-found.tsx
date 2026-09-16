import PublicLayout from "@/components/PublicLayout";
import Icon from "@/components/Icon";
import { publicData } from "@/services/data";
export default async function NotFound() {
  const data = await publicData();
  return (
    <PublicLayout data={data}>
      <div className="container section">
        <div className="empty-state">
          <p className="eyebrow">404 · THIS PATH ENDS HERE</p>
          <h1>Let’s find you somewhere lovely.</h1>
          <p>
            This page may have moved, or the stay may no longer be listed. There
            are more beautiful places to discover.
          </p>
          <a href="/resorts" className="button button-dark">
            Explore the stays
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
