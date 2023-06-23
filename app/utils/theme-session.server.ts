import { createCookieSessionStorage } from "@remix-run/node";
import { type UserPreference } from "~/routes/resources.theme.tsx";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

type Session = Awaited<ReturnType<typeof getSession>>;

const themeKey = "theme";

export async function getTheme(request: Request): Promise<UserPreference> {
  const session = await getSession(request.headers.get("Cookie"));
  const theme = session.get(themeKey);
  if (theme === "dark" || theme === "light") return theme;
  return null;
}

type NonNullUserPreference = Exclude<UserPreference, null>;
export function setTheme(session: Session, theme: NonNullUserPreference) {
  session.set(themeKey, theme);
}

export function deleteTheme(session: Session) {
  session.unset(themeKey);
}
