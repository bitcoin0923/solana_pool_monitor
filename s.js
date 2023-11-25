
import { Connection, PublicKey } from '@solana/web3.js';



function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const parseEvent = str => {
    const arr = str.split(",");
    let result = {};
    for (let i = 0; i < arr.length; i++) {
        const subArr = arr[i].split(":");
        result[subArr[0]] = subArr[1];
    }
    return result;
}

async function main() {

    const ContractAddress = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
    const TxnSig = "2fRDUbeixsJrBVuVShdoMycmBzQ3aZ7L3hwfQHJb5wSxtwApMyjSFXttECE7LWCrcrgwgbibsvbygVA82c9hqyNc"
    let lastTrxn = ""
    let lastBlockTime = 0;
    try {

        const connection = new Connection("https://dark-white-bush.solana-mainnet.quiknode.pro/68f75046f75452fc43cf4aba57373da40a43dddd/", 'confirmed');

        const txInfo = await connection.getParsedTransaction(
            TxnSig,
            { maxSupportedTransactionVersion: 0 }
        );
        let signer = "";
        let event_type = "";
        let logText = "";
        if (txInfo.transaction.message.instructions.length() == 4 && txInfo.transaction.message.instructions[2].data == '5uabYDw1ESqTsJLrJZTHdqq') {

            for (let j = 0; j < txInfo.transaction.message.accountKeys.length; j++) {
                if (txInfo.transaction?.message?.accountKeys[i]?.signer) {
                    signer = txInfo.transaction.message.accountKeys[i].pubkey.toString();
                    break;
                }
            }

            for (let j = 0; j < txInfo.meta.logMessages.length; j++) {
                if (txInfo.meta.logMessages[j].includes("event_type")) {
                    logText = txInfo.meta.logMessages[j];
                    try {
                        const result = parseEvent(`${txInfo.meta.logMessages[j].slice(13, txInfo.meta.logMessages[j].length)}`);
                        event_type = result.event_type;
                        if (result.event_type == "Token Transfer") {
                            const resp = await eventService.saveEvent(result);
                        }
                    } catch (e) {
                        console.log("save event error", e)
                    }
                }
            }
            lastTrxn = txs[i]?.signature;
            lastBlockTime = txs[i]?.blockTime;
        }
    } catch (e) {
        console.log(e)
    }
}


main();
