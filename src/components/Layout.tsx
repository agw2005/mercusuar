import { ComponentChildren } from "preact";

interface LayoutProps {
  name: string;
  children: ComponentChildren;
}

const Layout = ({ name, children }: LayoutProps) => {
  const routes: { title: string; url: string }[] = [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Ledger",
      url: "/ledger",
    },
    {
      title: "Habit",
      url: "/habit",
    },
    {
      title: "Health",
      url: "/health",
    },
  ];

  return (
    <>
      <header>
        <h1>{name}</h1>
        {routes.filter((route) => route.url !== globalThis.location.pathname)
          .map((route) => <a key={route.url} href={route.url}>{route.title}
          </a>)}
      </header>
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;
