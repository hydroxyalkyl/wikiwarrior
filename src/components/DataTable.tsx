import {Table} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import NewResearchQuantum from "../NewResearchQuantum.ts";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import HorizontalPillStack from "./HorizontalPillStack.tsx";
import {SettingsContext} from "../contexts/SettingsContext.tsx";
import {extractVideoIdFromUrl, parseVodDataJson} from "../utils/vod-data-parser.ts";
import {useNavigate} from "react-router-dom";
import jsonDataList from "../assets/clip-data.json"
import {Temporal} from "@js-temporal/polyfill";
import {parseDurationToTimeString, parseTimeStringToDuration} from "../utils/time-conversion.ts";

function DataTable() {
    const {settingsData} = useContext(SettingsContext);

    const navigate = useNavigate();
    const handleRowClick = (quantum: NewResearchQuantum) => () => {

        // Prevent navigation if text is selected
        const selection = window.getSelection();

        if (selection && selection.toString().length > 0) {
            return;
        }

        navigate(`/clip/${quantum.uuid}`);
    };

    const handleStopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Use this if you want to retrieve NewResearchQuanta objects from a backend
    // function callBackend() {
    //     return fetch('http://localhost:8000/research-quanta/')
    //         .then(response => response.json());
    // }

    const [researchQuanta, setResearchQuanta] = useState<NewResearchQuantum[]>([]);
    useEffect(() => {
        // callBackend()
        //     .then(setResearchQuanta)
        //     .catch((e: unknown) => {
        //         console.error(e)
        //     })
        retrieveQuanta()
            .then(setResearchQuanta)
            .catch((e: unknown) => {
                console.error(e)
            })
    }, []);

    const VOD_TITLE_LEN = 20;
    const truncateVodTitle = (vodTitle: string) => vodTitle.length > VOD_TITLE_LEN
        ? vodTitle.substring(0, VOD_TITLE_LEN - 3) + "..."
        : vodTitle;

    const videoUrlAtTime = (videoUrl: string, atTime: number) => `${videoUrl}&t=${atTime}`

    const columnHelper = createColumnHelper<NewResearchQuantum>();

    const columns = [
        columnHelper.accessor("vodFriendlyDate", {
            header: "Date",
        }),
        columnHelper.accessor("vodTitle", {
            header: "VOD",
            cell: info => <a href={info.row.original.videoUrl}
                             onClick={handleStopPropagation}>{truncateVodTitle(info.getValue())}</a>
        }),
        columnHelper.accessor("start", {
            header: "Start",
            cell: info => <a href={videoUrlAtTime(info.row.original.videoUrl, info.row.original.startSeconds)}
                             onClick={handleStopPropagation}>{info.getValue()}</a>
        }),
        columnHelper.accessor("end", {
            header: "End",
            cell: info => <a href={videoUrlAtTime(info.row.original.videoUrl, info.row.original.endSeconds)}
                             onClick={handleStopPropagation}>{info.getValue()}</a>
        }),
        columnHelper.accessor("duration", {
            header: "Duration",
        }),
        columnHelper.accessor("clipTitle", {
            header: "Title",
            cell: info =>
                <div style={{display: "flex", gap: "0.5em", alignItems: "center"}}>
                    <span>{info.getValue()}</span>
                    {settingsData.showPillsInTable as boolean && <HorizontalPillStack elems={info.row.original.tags}/>}
                </div>
        }),
    ]

    const table = useReactTable<NewResearchQuantum>({
        columns,
        data: researchQuanta,
        debugTable: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })

    return <Table hover id="research-table">
        <thead>
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                    return (
                        <th key={header.id} colSpan={header.colSpan} scope="col"
                            onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    )
                })}
            </tr>
        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => {
            return (
                <tr key={row.id} onClick={handleRowClick(row.original)}>
                    {row.getVisibleCells().map(visibleCell => {
                        return (
                            <td key={visibleCell.id}>
                                {flexRender(
                                    visibleCell.column.columnDef.cell,
                                    visibleCell.getContext())}
                            </td>
                        )
                    })}
                </tr>
            )
        })}
        </tbody>
    </Table>
}

function retrieveQuanta() {
    return Promise.all(jsonDataList.map(async jsonQuantum => {
        const videoId = extractVideoIdFromUrl(jsonQuantum.videoUrl);
        const startTemporal = parseTimeStringToDuration(jsonQuantum.start);
        const endTemporal = parseTimeStringToDuration(jsonQuantum.end);
        return {
            uuid: jsonQuantum.uuid,
            clipTitle: jsonQuantum.title,
            videoUrl: jsonQuantum.videoUrl,
            start: jsonQuantum.start,
            startSeconds: startTemporal.total("seconds"),
            end: jsonQuantum.end,
            endSeconds: endTemporal.total("seconds"),
            duration: parseDurationToTimeString(endTemporal.subtract(startTemporal)),
            tags: jsonQuantum.tags,
            ...(await parseVodDataJson(`stream-data/${videoId}.info.json`) ?? {})
        }
    })).then(researchQuanta => researchQuanta.map(researchQuantum => {
        return {
            vodTitle: researchQuantum.title ?? extractVideoIdFromUrl(researchQuantum.videoUrl),
            vodFriendlyDate: researchQuantum.releaseTimestamp 
                ? Temporal.Instant
                    .fromEpochSeconds(researchQuantum.releaseTimestamp)
                    .toZonedDateTimeISO("UTC")
                    .toPlainDate()
                    .toString()
                : "N/A",
            ...researchQuantum,
        } as NewResearchQuantum
    }))
}

export default DataTable;