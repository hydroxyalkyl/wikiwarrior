import DataTable from "../components/DataTable.tsx";
import ClipModal from "../components/ClipModal.tsx";
import {useEffect, useState} from "react";
import ResearchQuanta from "../ResearchQuanta.ts";
import {useNavigate, useParams} from "react-router-dom";
import jsonVodData from "../assets/clip-data.json"
import {TwitterX, Wikipedia, Youtube} from "react-bootstrap-icons";

const fetchQuantaByUUID = (uuid: string): ResearchQuanta | null => {
    return jsonVodData.find(b => b.uuid === uuid) ?? null;
};

function HomePage() {
    const [openedQuanta, setOpenedQuanta] = useState<ResearchQuanta | null>(null);
    const navigate = useNavigate();
    const {clipUuid} = useParams<{ clipUuid?: string }>(); // Get UUID from URL

    useEffect(() => {
        if (clipUuid) {
            const quanta = fetchQuantaByUUID(clipUuid);
            if (quanta) {
                setOpenedQuanta(quanta);
            } else {
                navigate('/');
            }
        }
    }, [clipUuid, navigate]);

    useEffect(() => {
        if (openedQuanta) {
            navigate(`/clip/${openedQuanta.uuid}`);
        } else {
            navigate('/');
        }
    }, [openedQuanta, navigate]);

    const onClose = () => {
        setOpenedQuanta(null);
    };

    const externalLinks = [
        {
            displayText: "@destiny",
            icon: <Youtube/>,
            href: "https://youtube.com/destiny"
        },
        {
            displayText: "@TheOmniLiberal",
            icon: <TwitterX/>,
            href: "https://twitter.com/TheOmniLiberal"
        },
        {
            displayText: "DGG Wiki",
            icon: <Wikipedia/>,
            href: "https://wiki.destiny.gg/"
        },
    ]

    return (
        <>
            <section id="hero-section" className="text-center mb-2">
                <h1>WikiWarrior</h1>
                <p className="lead">Is it true that Destiny is a wiki-warrior?</p>
            </section>

            <div className="gap-5 d-flex mb-4 justify-content-center">
                {
                    externalLinks.map(elem =>
                        <a target="_blank" href={elem.href} className="icon-link d-flex flex-column" key={elem.href}>
                            {elem.icon}
                            <span>{elem.displayText}</span>
                        </a>
                    )
                }
            </div>

            <DataTable/>
            {openedQuanta && <ClipModal isOpen={true} onClose={onClose} data={openedQuanta}/>}
        </>
    );
}

export {HomePage};