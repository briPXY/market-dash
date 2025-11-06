import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { subIndicatorList } from "./indicators/indicatorList";

const SubIndicatorYLabels = ({ name, width, height, yScaler, data, color }) => {
    const subYLabelRef = useRef(null);

    useEffect(() => {
        const subYLabelSvg = d3.select(subYLabelRef.current);
        subIndicatorList[name].yLabelDrawFn(subYLabelSvg, width, height, yScaler, data, color);
    }, [color, data, height, name, width, yScaler]);

    return (
        <>
            <svg
                className="p-0 m-0"
                width={width}
                height={height}
                ref={subYLabelRef}
            ></svg>
        </>
    );
};

export default React.memo(SubIndicatorYLabels);