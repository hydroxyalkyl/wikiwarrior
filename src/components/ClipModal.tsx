import React, {useContext, useEffect, useState} from 'react';
import ResearchQuanta from "../ResearchQuanta.ts";
import {parseTimeStringToDuration} from "../utils/time-conversion.ts";
import {extractVideoIdFromUrl} from "../utils/vod-data-parser.ts";
import {Button, Modal, Toast, ToastContainer} from "react-bootstrap";
import {
    Fullscreen,
    FullscreenExit,
    Link45deg,
    Play,
    XLg
} from "react-bootstrap-icons";

import HorizontalPillStack from "./HorizontalPillStack.tsx";
import {SettingsContext} from "../contexts/SettingsContext.tsx";
interface ToastConfig {
    show: boolean,
    text: string,
    bg: "primary" | "warning" | "danger" | "success",
}

const CopyUrlButton: React.FC<{ pathname: string }> = ({pathname}) => {
    const [toastConfig, setToastConfig] = useState<ToastConfig>({show: false, text: "", bg: "primary"})

    const hideToast = () => {
        setToastConfig({...toastConfig, show: false});
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.host + pathname);
            setToastConfig({show: true, text: "URL copied to clipboard!", bg: "success"});
        } catch (err) {
            console.error(err);
            setToastConfig({show: true, text: "Couldn't copy text to clipboard.", bg: "danger"});
        }
    };

    return (
        <>
            <Button onClick={() => void copyToClipboard()} variant="primary"><Link45deg/> Copy Link</Button>

            <ToastContainer position="bottom-start" className="p-2">
                <Toast show={toastConfig.show} onClose={hideToast} bg={toastConfig.bg}>
                    <Toast.Header>
                        <strong className="me-auto">Copy Link</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body>{toastConfig.text}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

interface ClipModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ResearchQuanta;
}

export default function ClipModal({isOpen, onClose: onCloseParent, data}: ClipModalProps) {
    const settingsContext = useContext(SettingsContext);

    const DEFAULT_MODAL_IS_FS = false;

    const {settingsData} = settingsContext;
    const [fullscreenModals, setFullscreenModals] = useState(settingsData.fullscreenModals ?? DEFAULT_MODAL_IS_FS);

    useEffect(
        () => {
            setFullscreenModals(settingsData.fullscreenModals ?? DEFAULT_MODAL_IS_FS);
        },
        [DEFAULT_MODAL_IS_FS, settingsData]
    );

    const handleFullscreenToggle = () => {
        setFullscreenModals(!fullscreenModals);
    };

    const onClose = () => {
        onCloseParent();
        setFullscreenModals(settingsData.fullscreenModals ?? DEFAULT_MODAL_IS_FS);
    }

    const videoId = extractVideoIdFromUrl(data.videoUrl);

    const startInSeconds = parseTimeStringToDuration(data.start).total("seconds");
    const endInSeconds = parseTimeStringToDuration(data.end).total("seconds");

    const iframeUrl = `https://youtube.com/embed/${videoId}?&start=${startInSeconds}&end=${endInSeconds}&mute=${!settingsData.startClipsWithSound}&autoplay=${settingsData.autoplayClips}`
    const iframeStyle = {
        border: "none",
        display: "block",
        aspectRatio: 16 / 9,
        flexGrow: 1,
        height: fullscreenModals ? "1%" : "initial"
    }

    return (
        <Modal show={isOpen}
               onHide={onClose}
               size="lg"
               centered
               fullscreen={fullscreenModals ? true : undefined}
               animation={false}
        >
            <Modal.Header>
                <Modal.Title>{data.title}</Modal.Title>
                <div style={{marginLeft: 'auto', display: 'flex', alignItems: "baseline"}}>
                    <Button variant="link" onClick={handleFullscreenToggle}>
                        {fullscreenModals ? <FullscreenExit size={20}/> : <Fullscreen size={20}/>}
                    </Button>
                    <Button variant="link" onClick={onClose}><XLg size={24}/></Button>
                </div>
            </Modal.Header>

            <Modal.Body style={{display: "flex", flexDirection: "column"}}>
                <span className="text-center">{data.description}</span>
                <ul>
                    {data.sources.map(source => <li key={source}><a href={source} target="_blank">{source}</a></li>)}
                </ul>
                <HorizontalPillStack elems={data.tags}/>
                <hr/>
                <iframe src={iframeUrl} style={iframeStyle} allowFullScreen/>
            </Modal.Body>

            <Modal.Footer>
                <Button href={`https://vyneer.me/vods/?v=${videoId}&t=${startInSeconds}`} target="_blank">
                    <Play/> Watch on Orvods
                </Button>
                <CopyUrlButton pathname={`/clip/${data.uuid}`}/>
            </Modal.Footer>
        </Modal>
    );
}