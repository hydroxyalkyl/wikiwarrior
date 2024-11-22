import './css/index.css'

import {NavBar} from "./components/NavBar.tsx";
import {Outlet} from "react-router-dom";
import Footer from "./components/Footer.tsx";

function App() {
    return <>
        <NavBar/>
        <main style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "0.5em"}}>
            <Outlet/>
        </main>
        <Footer/>
    </>
}

export {App}
