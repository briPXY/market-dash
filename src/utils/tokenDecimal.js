import { ethers } from "ethers";

export const getTokenDecimals = async (tokenAddress, provider) => {
    try {
        const erc20ABI = ["function decimals() view returns (uint8)"];
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
        const decimals = await tokenContract.decimals();
        console.log(`Decimals for token ${tokenAddress}:`, decimals);
        return decimals;
    } catch (error) {
        console.error("Error fetching token decimals:", error);
        return null;
    }
}; 