import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sessionValid } from "@/lib/auth";
import Icon from "@/components/Icon";
import AdminScripts from "@/components/AdminScripts";
export const metadata = { title: "Admin sign in" };
export default async function Login() {
  const token = (await cookies()).get("vibe_admin")?.value;
  let valid = false;
  try {
    valid = await sessionValid(token);
  } catch {}
  if (valid) redirect("/admin");
  const csrf =
    (await cookies()).get("vibe_csrf")?.value ||
    (await headers()).get("x-vibe-csrf") ||
    "";
  const configured = !!process.env.ADMIN_PASSWORD_HASH;
  return (
    <div className="login-body">
      <meta name="csrf-token" content={csrf} />
      <div className="login-brand-panel">
        <a href="/">
          <img
            src="/images/brand-round.png"
            alt="Vibe Stayz"
            width="100"
            height="100"
          />
        </a>
        <div>
          <p className="eyebrow">THE CONTENT STUDIO</p>
          <h1>
            Beautiful stays.
            <br />
            Thoughtfully managed.
          </h1>
          <p>
            A little care behind the scenes.
            <br />A lovely experience for every guest.
          </p>
        </div>
        <a className="text-link light" href="/">
          Back to the website
          <Icon name="arrow" size={17} />
        </a>
      </div>
      <main className="login-main">
        <form id="admin-login" className="login-form">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Your collection awaits.</h2>
          <p>Sign in to manage your stays and website.</p>
          {!configured && (
            <div className="error-note">
              Admin access is not configured yet. The website owner needs to set
              the server admin credentials.
            </div>
          )}
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div id="login-error" className="error-note" role="alert" hidden />
          <button className="button button-dark" type="submit">
            Sign in to your workspace
            <Icon name="arrow" size={18} />
          </button>
          <p className="login-note">Private access for the Vibe Stayz team.</p>
        </form>
      </main>
      <AdminScripts />
    </div>
  );
}
