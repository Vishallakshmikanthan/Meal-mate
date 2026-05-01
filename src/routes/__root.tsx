import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { ChatWidget } from "@/components/ChatWidget";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That dish isn't on the menu today.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MealOps — Smart Mess Companion" },
      {
        name: "description",
        content:
          "Track your mess meals, scan food with AI, and pre-order tomorrow's plate. Free, no API keys, runs entirely in your browser.",
      },
      { property: "og:title", content: "MealOps — Smart Mess Companion" },
      {
        property: "og:description",
        content: "Mess menu, AI food scanner, and meal log — all in one app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "MealOps — Smart Mess Companion" },
      { name: "description", content: "Meal Mate is a free, client-side application for tracking daily meals and nutrition." },
      { property: "og:description", content: "Meal Mate is a free, client-side application for tracking daily meals and nutrition." },
      { name: "twitter:description", content: "Meal Mate is a free, client-side application for tracking daily meals and nutrition." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/41ce2c70-3a56-4edc-9b78-fb317ab2b451/id-preview-da98d77f--41814868-3f06-447e-9268-3ea45ca20db0.lovable.app-1777544124060.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/41ce2c70-3a56-4edc-9b78-fb317ab2b451/id-preview-da98d77f--41814868-3f06-447e-9268-3ea45ca20db0.lovable.app-1777544124060.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="relative min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-8">
        <Outlet />
      </main>
      <MobileNav />
      <ChatWidget />
    </div>
  );
}
