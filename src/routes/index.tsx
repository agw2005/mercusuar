import "#/App.css";

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <a href="/about" className={`text-blue-500 hover:text-red-500`}>
                About
            </a>
        </div>
    );
}

export default Home;
