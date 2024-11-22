// Very bad idea to use this in production I am aware
import {Temporal} from "@js-temporal/polyfill";

export function parseTimeStringToDuration(timeString: string): Temporal.Duration {
    const timeComponents = timeString.split(':').map(Number);

    let hours = 0, minutes = 0, seconds = 0;

    if (timeComponents.length === 3) {
        [hours, minutes, seconds] = timeComponents;
    } else if (timeComponents.length === 2) {
        [minutes, seconds] = timeComponents;
    } else {
        throw new Error("Invalid time format: Please use HH:MM:SS or MM:SS");
    }

    return Temporal.Duration.from({hours, minutes, seconds});
}

export function parseDurationToTimeString(duration: Temporal.Duration): string {
    const totalSeconds = duration.total({unit: 'seconds'});

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}