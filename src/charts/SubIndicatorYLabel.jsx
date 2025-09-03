import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { subIndicatorList } from "./indicators/indicatorList"; 

const SubIndicatorYLabels = ({ width, height, scaleY, subIndicator}) => {
    const subYLabelRef = useRef(null);
    const subYLabelSvg = d3.select(subYLabelRef.current);

    useEffect(() => {
        subIndicatorList[subIndicator].yLabelDrawFn(subYLabelSvg, width, height, scaleY);
    }, [height, scaleY, subIndicator, subYLabelSvg, width]);

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