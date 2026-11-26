import { ComponentChildren } from "preact";

interface LayoutProps {
    name: string;
    children: ComponentChildren;
}

const Layout = ({ name, children }: LayoutProps) => {
    return (
        <>
            <header>
                <h1>{name}</h1>
                <a href="/">Home</a>
                <a href="/habit">Habit</a>
                <a href="/health">Health</a>
            </header>
            <main>
                {children}
            </main>
        </>
    );
};

export default Layout;
