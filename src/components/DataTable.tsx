import jsonDataList from "../assets/clip-data.json"
import DataRow from "./DataRow.tsx";
import {Table} from "react-bootstrap";

function DataTable() {
    return <Table hover id="research-table">
        <thead>
            <tr>
                <th scope="col">Date</th>
                <th scope="col">VOD</th>
                <th scope="col">Start</th>
                <th scope="col">End</th>
                <th scope="col">Duration</th>
                <th scope="col">Title</th>
            </tr>
        </thead>
        <tbody>
            {jsonDataList.map(jsonQuanta => <DataRow data={jsonQuanta} key={jsonQuanta.uuid}/>)}
        </tbody>
    </Table>
}

export default DataTable;