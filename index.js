
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
  let lastTrxn = "2fRDUbeixsJrBVuVShdoMycmBzQ3aZ7L3hwfQHJb5wSxtwApMyjSFXttECE7LWCrcrgwgbibsvbygVA82c9hqyNc"
  let lastBlockTime = 0;

  while (true) {
    try {
      const connection = new Connection("https://dark-white-bush.solana-mainnet.quiknode.pro/68f75046f75452fc43cf4aba57373da40a43dddd/", 'finalized');
      if (lastTrxn == "") {
        const txs = await connection.getSignaturesForAddress(new PublicKey(ContractAddress), { limit: 1 });
        lastTrxn = txs[0]?.signature;
      } else {
        const newTxs = await connection.getSignaturesForAddress(new PublicKey(ContractAddress), { until: lastTrxn });
        const txs = newTxs.reverse();
        if (txs.length == 0) {
          await delay(1000);
        } else {
          for (let i = 0; i < txs.length; i++) {
            if (txs[i].blockTime < lastBlockTime) {
              continue;
            }
            if (txs[i].confirmationStatus != "finalized") {
              continue;
            }

            const txInfo = await connection.getParsedTransaction(
              txs[i]?.signature,
              { maxSupportedTransactionVersion: 0 }
            );
            let isSwap = false;
            for (let iii = 0; iii < txInfo.transaction.message.instructions.length; iii++) {
              const element = txInfo.transaction.message.instructions[iii];
              if (element.data == ("5uabYDw1ESq")) {
                isSwap = true;
                break;
              }
            }
            if (isSwap) {
              console.log("txInfo", txInfo)
            }
            let signer = "";
            let event_type = "";
            let logText = "";
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
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}


main();
