import { useMemo } from "react"
import { SourceConst } from "../constants/sourceConst";

export function Price({ input, className, style = {} }) {
    const price = useMemo(() => {

    }, [input]);

    return (
        <div className={className} style={style}>{price}</div>

    )
}