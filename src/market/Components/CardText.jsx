import { Flex } from "../../Layout/Layout";
import { Text } from "../../Layout/elements";

export function CardText({big, small}){
    return(
        <Flex className="flex-col gap-0 m-0 p-0 items-start">
            <Text as="h6">{big}</Text> 
            <Text as="small">{small}</Text> 
        </Flex>
    );
}