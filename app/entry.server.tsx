import {
  createReadableStreamFromReadable,
  type HandleDocumentRequestFunction,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "stream";
import { NonceProvider } from "./utils/nonce-provider.ts";
import { getEnv, init } from "./utils/env.server.ts";

const ABORT_DELAY = 5000;

init();
global.ENV = getEnv();

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;

export default async function handleRequest(...args: DocRequestArgs) {
  const [
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    loadContext,
  ] = args;
  responseHeaders.set("fly-region", process.env.FLY_REGION ?? "unknown");
  responseHeaders.set("fly-app", process.env.FLY_APP_NAME ?? "unknown");

  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  const nonce = String(loadContext.cspNonce) ?? undefined;
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer context={remixContext} url={request.url} />
      </NonceProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError: (err: unknown) => {
          reject(err);
        },
        onError: (error: unknown) => {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export async function handleDataRequest(response: Response) {
  response.headers.set("fly-region", process.env.FLY_REGION ?? "unknown");
  response.headers.set("fly-app", process.env.FLY_APP_NAME ?? "unknown");

  return response;
}
