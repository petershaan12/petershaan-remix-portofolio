import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import "./tailwind.css";
import { cn } from "./lib/utils";
import { SiteHeader } from "./components/site-header";
import { themeSessionResolver } from "./session.server";
import { ThemeProvider, PreventFlashOnWrongTheme, useTheme } from "remix-themes";
import clsx from "clsx";
import { SiteFooter } from "./components/site-footer";
import NotFound from "./components/not-found";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/icon.png",
    type: "image/png",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
}


function Layout({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme(); 
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <div className="relative flex flex-col">
          <SiteHeader />
          <main className="flex-1 antialiased max-w-2xl mx-auto">{children}</main>
          <SiteFooter />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <Layout>
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
}


