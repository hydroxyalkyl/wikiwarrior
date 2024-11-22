import {Alert, AlertLink} from "react-bootstrap";

function SubmitClipPage() {
    return (
        <Alert variant="danger">
            The HTML form is in progress.
            Please use <AlertLink target="_blank" href="https://forms.gle/6rqSqCjPaWJFraXy8"> this Google Form</AlertLink> instead.
            Emails are only collected to prevent spam and are not shared.
        </Alert>
    );
};

export {SubmitClipPage};