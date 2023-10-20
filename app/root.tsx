import {
  json,
  type LinksFunction,
  type DataFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ClientHintCheck, getHints } from "./utils/client-hints.tsx";
import { getDomainUrl } from "./utils/misc.server.ts";
import { useNonce } from "./utils/nonce-provider.ts";
import { useTheme } from "./routes/resources.theme.tsx";
import { getTheme } from "./utils/theme-session.server.ts";
import { getEnv } from "./utils/env.server.ts";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css",
  },
];

export async function loader({ request }: DataFunctionArgs) {
  return json({
    requestInfo: {
      hints: getHints(request),
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
      session: {
        theme: await getTheme(request),
      },
    },
    ENV: getEnv(),
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const theme = useTheme();
  const nonce = useNonce();

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}
