import * as React from "react";
import { json, type DataFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useHints } from "~/utils/client-hints.tsx";
import { useRequestInfo } from "~/utils/request-info.ts";
import {
  commitSession,
  deleteTheme,
  getSession,
  setTheme,
} from "~/utils/theme-session.server.ts";
import { safeRedirect } from "~/utils/misc.tsx";

const ROUTE_PATH = "/resources/theme";

const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
const isValidTheme = (theme: unknown): theme is Theme =>
  typeof theme === "string" && THEMES.includes(theme as Theme);
export type UserPreference = Exclude<Theme, "system"> | null;

export async function action({ request }: DataFunctionArgs) {
  const { theme, redirectTo } = Object.fromEntries(await request.formData());
  invariant(isValidTheme(theme), "Invalid theme");

  const session = await getSession(request.headers.get("cookie"));
  if (theme === "system") {
    deleteTheme(session);
  } else {
    setTheme(session, theme);
  }

  const responseInit = {
    headers: { "Set-Cookie": await commitSession(session) },
  };

  if (typeof redirectTo === "string") {
    return redirect(safeRedirect(redirectTo), responseInit);
  }
  return json({ success: true }, responseInit);
}

export function ThemeSelect() {
  const requestInfo = useRequestInfo();
  const fetcher = useFetcher();

  const [isHydrated, setIsHydrated] = React.useState(false);
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const userPreference = requestInfo.session.theme;
  const mode = userPreference ?? "system";

  const submit = (theme: Theme) => {
    fetcher.submit(
      {
        theme,
        /*
					this is for progressive enhancement so we redirect them to the page
					they are on if the JavaScript hasn't had a chance to hydrate yet.
				*/
        ...(isHydrated ? {} : { redirectTo: requestInfo.path }),
      },
      { method: "POST", action: ROUTE_PATH }
    );
  };

  return (
    <details role="list" dir="rtl">
      <summary aria-haspopup="listbox" role="link" className="secondary">
        Theme
      </summary>
      <ul role="listbox">
        {THEMES.map((theme) => (
          <li key={theme} onClick={() => submit(theme)}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              {...(mode === theme
                ? {
                    style: {
                      backgroundColor: "var(--primary-focus)",
                    },
                    "aria-selected": true,
                  }
                : {})}
              href="#"
            >
              {theme[0].toUpperCase() + theme.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  return requestInfo.session.theme ?? hints.theme;
}
