import ResearchQuanta from "../ResearchQuanta.ts";
import React, {useContext, useEffect, useState} from "react";
import {extractVideoIdFromUrl, parseVodDataJson, VODData} from "../utils/vod-data-parser.ts";
import {parseDurationToTimeString, parseTimeStringToDuration} from "../utils/time-conversion.ts";
import {Temporal} from "@js-temporal/polyfill";
import {useNavigate} from "react-router-dom";
import HorizontalPillStack from "./HorizontalPillStack.tsx";
import {SettingsContext} from "../contexts/SettingsContext.tsx";

interface DataRowProps<T> {
    data: T
}

function DataRow({ data }: DataRowProps<ResearchQuanta>) {
    const {settingsData} = useContext(SettingsContext);

    // Data on the VOD itself, such as release date, duration, title, etc.
    const [vodMetadata, setVodMetadata] = useState<VODData | null>(null);

    const navigate = useNavigate();

    const {
        title: clipTitle,
        videoUrl,
        start,
        end
    } = data;

    const videoId = extractVideoIdFromUrl(videoUrl);

    useEffect(() => {
        void parseVodDataJson(`stream-data/${videoId}.info.json`).then(setVodMetadata);
    }, [videoId]);

    const startTemporal = parseTimeStringToDuration(start);
    const endTemporal = parseTimeStringToDuration(end);
    const durationTemporal = endTemporal.subtract(startTemporal);

    let vodTitle, vodFriendlyDate;

    if (vodMetadata === null) {
        vodTitle = videoId;
        vodFriendlyDate = "N/A";
    } else {
        vodTitle = vodMetadata.title;
        vodFriendlyDate = Temporal.Instant
            .fromEpochSeconds(vodMetadata.releaseTimestamp)
            .toZonedDateTimeISO("UTC")
            .toPlainDate()
            .toString()
    }

    const VOD_TITLE_LEN = 20;
    const vodTitleTruncated = vodTitle.length > VOD_TITLE_LEN ? vodTitle.substring(0, VOD_TITLE_LEN - 3) + "..." : vodTitle;

    const handleRowClick = () => {

        // Prevent navigation if text is selected
        const selection = window.getSelection();

        if (selection && selection.toString().length > 0) {
            return;
        }

        navigate(`/clip/${data.uuid}`);
    };

    const handleStopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <tr onClick={handleRowClick} style={{cursor: "pointer"}}>
            <td>{vodFriendlyDate}</td>

            <td>
                <a href={videoUrl} target="_blank" title={vodTitle} style={{textDecoration: "none"}}
                   onClick={handleStopPropagation}>
                    {vodTitleTruncated}
                </a>
            </td>

            <td style={{textAlign: "center"}}>
                <a href={`${videoUrl}&t=${startTemporal.total("seconds")}`} target="_blank"
                   style={{textDecoration: "none"}} onClick={handleStopPropagation}>
                    {start}
                </a>
            </td>

            <td style={{textAlign: "center"}}>
                <a href={`${videoUrl}&t=${endTemporal.total("seconds")}`} target="_blank"
                   style={{textDecoration: "none"}} onClick={handleStopPropagation}>
                    {end}
                </a>
            </td>

            <td style={{textAlign: "center"}}>
                {parseDurationToTimeString(durationTemporal)}
            </td>

            <td>
                <div style={{display: "flex", gap: "0.5em", alignItems: "center"}}>
                    <span>{clipTitle}</span>
                    {settingsData.showPillsInTable as boolean && <HorizontalPillStack elems={data.tags}/>}
                </div>
            </td>
        </tr>
    );
};

export default DataRow;