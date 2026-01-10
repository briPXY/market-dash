import axios from "axios";
import { deletUserSecretKey, getUserSecret, setUserSecret } from "../user/user.datamanager.js"
import { ethers } from "ethers";

const walletSchema = {
    schema: {
        body: {
            type: "object",
            required: ["walletAddress", "signature", "message"],
            properties: {
                walletAddress: { type: "string", minLength: 20, maxLength: 64 },
                signature: { type: "string", minLength: 40, maxLength: 256 },
                message: { type: "string", minLength: 2, maxLength: 512 },
                apiKey: { type: "string", minLength: 2, maxLength: 512 },
                keyName: { type: "string", minLength: 2, maxLength: 512 },
            }
        }
    }
};

async function validateSubgraphApiKey(apiKey) {
    const subgraphUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp`;
    const minimalQuery = `
        query {
            _meta {
                deployment
            }
        }
    `;

    try {
        const response = await axios.post(subgraphUrl, { query: minimalQuery, }, { headers: { 'Content-Type': 'application/json', }, timeout: 5000, });

        if (response.status === 200 && response.data && response.data.data && response.data.data._meta) {
            return true;
        }

        throw new Error(`Subgraph API key is invalid`);

    } catch (error) {
        console.error('validateSubgraphApiKey error', error && (error.response || error.message || error));
        throw new Error(`Subgraph API key is invalid`);
    }
}

function validateEtherWalletInfo(message, signature, walletAddress) {
    if (!message || !signature || !walletAddress) {
        throw new Error("Missing required parameters for validation.");
    }
    // validate signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const normalizedExpectedAddress = ethers.getAddress(walletAddress);
    if (recoveredAddress.toLowerCase() !== normalizedExpectedAddress.toLowerCase()) throw new Error("Wallet signature failed to validate");

    return true;
}

export default async function userHttp(fastify) {
    fastify.post("/user/evm-wallet/submit-subgraph-key", walletSchema, async (request, reply) => {
        try {
            const { walletAddress, apiKey, signature, message } = request.body;

            if (!message || !signature || !walletAddress) {
                throw new Error("Missing required parameters for validation.");
            }
            // validate signature
            const recoveredAddress = ethers.verifyMessage(message, signature);
            const normalizedExpectedAddress = ethers.getAddress(walletAddress);
            if (recoveredAddress.toLowerCase() !== normalizedExpectedAddress.toLowerCase()) throw new Error("Wallet signature failed to validate");

            await validateSubgraphApiKey(apiKey);
            await setUserSecret("subgraph_api_key", walletAddress, apiKey, signature);

            return reply.code(200).send({ success: true });

        } catch (error) {
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message,
            });
        }
    }
    );

    fastify.post("/user/evm-wallet/check-saved-key", walletSchema, async (request, reply) => {
        try {
            const { walletAddress, signature, message, keyName } = request.body;
            validateEtherWalletInfo(message, signature, walletAddress);
            const secret = await getUserSecret(keyName, walletAddress, signature);

            if (secret) {
                return reply.code(200).send({ saved: true, success: true });
            }

            return reply.code(200).send({ saved: false, success: true });

        } catch (error) {
            console.error(error);
            return reply.code(400).send({ success: false, error });
        }
    });

    fastify.post("/user/evm-wallet/delete-saved-key", walletSchema, async (request, reply) => {
        try {
            const { walletAddress, signature, message, keyName } = request.body;
            validateEtherWalletInfo(message, signature, walletAddress);
            const deleteSuccess = await deletUserSecretKey(keyName, walletAddress);

            if (deleteSuccess) {
                return reply.code(200).send({ deleted: true, success: true });
            }

        } catch (error) {
            console.error(error);
            return reply.code(400).send({ success: false, error });
        }
    });
}
