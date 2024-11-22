import {Badge, Stack} from "react-bootstrap";

interface HorizontalPillStackProps {
    elems: string[]
}

function HorizontalPillStack({elems}: HorizontalPillStackProps) {
    return <Stack direction="horizontal" gap={2} className="justify-content-center">
        {elems.map(tag => {
            // Can choose different Bootstrap colours based on tag content
            // TODO: Experiment with colours other than the default Bootstrap ones
            const theme = "primary"

            return <Badge pill bg={`${theme}-subtle`} text={`${theme}-emphasis`}
                          className={`border-${theme}-subtle border`}
                          key={tag}>
                {tag}
            </Badge>
        })}
    </Stack>
}

export default HorizontalPillStack;