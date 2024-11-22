import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {App} from './App.tsx'

import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {AboutPage} from "./pages/AboutPage.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {SubmitClipPage} from "./pages/SubmitClipPage.tsx";
import {SettingsPage} from "./pages/SettingsPage.tsx";
import SettingsProvider from "./contexts/SettingsContext.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {element: <HomePage/>, index: true},
            {path: "/about", element: <AboutPage/>},
            {path: "/clip/:clipUuid", element: <HomePage/>},
            {path: "/submit", element: <SubmitClipPage/>},
            {path: "/settings", element: <SettingsPage/>},
            {path: "/*", element: <NotFoundPage/>}
        ]
    }
])

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router}/>
        </SettingsProvider>
    </StrictMode>
)
