interface RawVodData {
    id: string;
    title: string;
    duration: number;
    release_timestamp: number; // Matches the JSON field name (snake_case)
}

function isValidRawVodData(data: unknown): data is RawVodData {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    return (
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.duration === 'number' &&
        typeof obj.release_timestamp === 'number'
    );
}

export interface VODMetadata {
    id: string;
    title: string;
    duration: number;
    releaseTimestamp: number; // Uses camelCase
}

export function extractVideoIdFromUrl(videoUrl: string): string {
    const videoIdRegex = /^(?:.*(?:youtu\.be\/|v\/vi\/u\/\w\/|embed\/|shorts\/)|.*(?:watch)?\?vi?=|&vi?=)([^#&?]+)/;
    const match = videoIdRegex.exec(videoUrl);

    if (!match) {
        throw new Error('Invalid YouTube video URL: Video ID not found');
    }

    return match[1];
}

export async function parseVodDataJson(path: string): Promise<VODMetadata> {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load file from ${path}, status: ${response.status}`);
    }

    const jsonRepr: unknown = await response.json();

    if (isValidRawVodData(jsonRepr)) {
        // Map release_timestamp to releaseTimestamp
        return {
            id: jsonRepr.id,
            title: jsonRepr.title,
            duration: jsonRepr.duration,
            releaseTimestamp: jsonRepr.release_timestamp, // Map snake_case to camelCase
        };
    } else {
        throw new Error("Invalid VOD data structure in JSON file");
    }
}