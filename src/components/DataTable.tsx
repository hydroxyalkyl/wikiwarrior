import {Table} from "react-bootstrap";
import React, {useContext, useEffect, useRef, useState} from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    useReactTable
} from "@tanstack/react-table";
import HorizontalPillStack from "./HorizontalPillStack.tsx";
import {SettingsContext} from "../contexts/SettingsContext.tsx";
import {extractVideoIdFromUrl, parseVodDataJson, VODMetadata} from "../utils/vod-data-parser.ts";
import {useNavigate} from "react-router-dom";
import jsonDataList from "../assets/clip-data.json";
import {Temporal} from "@js-temporal/polyfill";
import {parseDurationToTimeString, parseTimeStringToDuration} from "../utils/time-conversion.ts";
import ResearchQuanta from "../ResearchQuanta.ts";
import {ArrowDown, ArrowDownUp, ArrowUp} from "react-bootstrap-icons";
import Duration = Temporal.Duration;

function durationSortingFn(rowA: Row<ResearchQuanta>, rowB: Row<ResearchQuanta>, columnId: string) {
    return Duration.compare(rowA.getValue(columnId), rowB.getValue(columnId))
}

function DataTable() {
    const {settingsData} = useContext(SettingsContext);

    const navigate = useNavigate();

    const handleRowClick = (quantum: ResearchQuanta) => () => {
        // Prevent navigation/opening the modal if text is selected
        // i.e. the user is just selecting some text from the row

        // Check if the selection both exists and is non-empty
        if (!window.getSelection()?.toString()) {
            navigate(`/clip/${quantum.uuid}`);
        }
    };

    const handleStopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const [researchQuantaData, setResearchQuantaData] = useState<ResearchQuanta[]>([]);

    // Initially populate the data array
    useEffect(() => {
        setResearchQuantaData(jsonDataList);
    }, []);


    const [vodMetadataCache, setVodMetadataCache] = useState<Map<string, VODMetadata>>(new Map());

    const cacheRef = useRef(vodMetadataCache); // Use ref to maintain a mutable cache.

    useEffect(() => {
        const fetchVodMetadata = async () => {

            // Create a local copy of the cache to avoid stale state issues
            const updatedCache = new Map(cacheRef.current);

            for (const quanta of researchQuantaData) {
                const videoId = extractVideoIdFromUrl(quanta.videoUrl);

                if (updatedCache.has(videoId)) {
                    continue;
                }

                try {
                    const data = await parseVodDataJson(`stream-data/${videoId}.info.json`);
                    updatedCache.set(videoId, data);
                } catch {
                    console.error(`Failed to fetch metadata for video ${videoId}`);
                }
            }

            setVodMetadataCache(updatedCache);
        };

        if (researchQuantaData.length > 0) {
            void fetchVodMetadata();
        }
    }, [researchQuantaData]);


    const DEFAULT_VOD_TITLE_CUTOFF_LEN = 20;

    const truncateVodTitle = (vodTitle: string, length: number = DEFAULT_VOD_TITLE_CUTOFF_LEN): string => {
        if (vodTitle.length > length) {
            return vodTitle.substring(0, length - 3) + "...";
        } else {
            return vodTitle;
        }
    }

    const videoUrlAtTime = (videoUrl: string, seconds: number) => `${videoUrl}&t=${seconds}`

    const columnHelper = createColumnHelper<ResearchQuanta>();

    const columns = [
        columnHelper.accessor("videoUrl", {
            id: "vod",
            header: "VOD",
            cell: props => {
                const videoId = extractVideoIdFromUrl(props.getValue());
                return <a
                    href={props.getValue()}
                    target="_blank"
                    onClick={handleStopPropagation}
                    style={{textDecoration: "none"}}
                >
                    {truncateVodTitle(vodMetadataCache.get(videoId)?.title ?? videoId)}
                </a>
            },
            sortingFn: (rowA, rowB, columnId) => {
                // This hefty function is to make sure we're comparing the right value for each row.
                // Some rows will have VOD Video IDs, whereas some rows will have VOD titles.
                // localeCompare is already case-insensitive.

                const videoIdRowA = extractVideoIdFromUrl(rowA.getValue(columnId))
                const valueToCompareRowA = vodMetadataCache.get(videoIdRowA)?.title ?? videoIdRowA;

                const videoIdRowB = extractVideoIdFromUrl(rowB.getValue(columnId))
                const valueToCompareRowB = vodMetadataCache.get(videoIdRowB)?.title ?? videoIdRowB;

                return valueToCompareRowA.localeCompare(valueToCompareRowB)
            }
        }),

        columnHelper.accessor(props => parseTimeStringToDuration(props.start), {
            id: "start",
            header: "Start",
            sortingFn: durationSortingFn,
            cell: props => (
                <a
                    target="_blank"
                    href={videoUrlAtTime(props.row.original.videoUrl, props.getValue().total("seconds"))}
                    onClick={handleStopPropagation}
                    style={{textDecoration: "none"}}
                >
                    {parseDurationToTimeString(props.getValue())}
                </a>
            ),
        }),

        columnHelper.accessor(row => parseTimeStringToDuration(row.end), {
            id: "end",
            header: "End",
            sortingFn: durationSortingFn,
            cell: props => (
                <a
                    target="_blank"
                    href={videoUrlAtTime(props.row.original.videoUrl, props.getValue().total("seconds"))}
                    onClick={handleStopPropagation}
                    style={{textDecoration: "none"}}
                >
                    {parseDurationToTimeString(props.getValue())}
                </a>
            ),
        }),

        columnHelper.accessor(row => parseTimeStringToDuration(row.end).subtract(parseTimeStringToDuration(row.start)), {
            id: "duration",
            header: "Duration",
            sortingFn: durationSortingFn,
            cell: props => <span>{parseDurationToTimeString(props.getValue())}</span>,
        }),

        columnHelper.accessor("title", {
            header: "Title",
            id: "title",
            cell: props => (
                <div style={{display: "flex", gap: "0.5em", alignItems: "center"}}>
                    <span>{props.getValue()}</span>
                    {settingsData.showPillsInTable ? <HorizontalPillStack elems={props.row.original.tags}/> : <></>}
                </div>
            ),
            sortingFn: (rowA, rowB, columnId) => {
                // This function is needed to make numbers come before strings in the sorting.

                const titleRowA: string = rowA.getValue(columnId);
                const titleRowB: string = rowB.getValue(columnId);

                return titleRowA.localeCompare(titleRowB);
            }
        }),
    ];

    const table = useReactTable<ResearchQuanta>({
        columns,
        data: researchQuantaData,
        debugTable: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        sortDescFirst: false,
    })

    return <Table hover id="research-table">
        <thead>
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                    const sortStatus = header.column.getIsSorted()
                    return (
                        <th key={header.id}
                            colSpan={header.colSpan}
                            scope="col"
                            onClick={header.column.getToggleSortingHandler()}
                            style={{cursor: "pointer"}}

                        >
                            {sortStatus == "asc" ? <ArrowUp/> : sortStatus == "desc" ? <ArrowDown/> : <ArrowDownUp/>}
                            &nbsp;
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    )
                })}
            </tr>
        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => (
            <tr key={row.id} onClick={handleRowClick(row.original)} style={{cursor: "pointer"}}>
                {row.getVisibleCells().map(visibleCell => (
                    <td key={visibleCell.id}>
                        {flexRender(visibleCell.column.columnDef.cell, visibleCell.getContext())}
                    </td>
                ))}
            </tr>
        ))}
        </tbody>
    </Table>
}

export default DataTable;