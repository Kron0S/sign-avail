import { readFileSync } from "fs";
import { Keyring } from "@polkadot/api";
import '@polkadot/api-augment';
import { initialize } from "avail-js-sdk"

sign().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function sign () {
  const provider = process.env.PROVIDER;
  const secretFileName = process.env.SECRET_FILE_NAME;
  const password = process.env.PASSWORD;
  const rawTransaction = process.env.RAW_TRANSACTION;

  const api = await initialize(provider)

  const keyring = new Keyring({ type: "sr25519" });
  const fileContent = readFileSync(
    secretFileName,
    "utf8"
  );
  const keyInfo = JSON.parse(fileContent);
  const sender = keyring.addFromJson(keyInfo);
  sender.decodePkcs8(password);

  const unsigned = api.tx(rawTransaction);
  
  /*
  const txResult = await new Promise((res) => {
    unsigned.signAndSend(sender, (result) => {
      console.log(`Tx status: ${result.status}`)
      if (result.isFinalized || result.isError) {
        res(result)
      }
    })
  })
  console.log(`Tx result: ${txResult.status}`)
  */

  const signedExtrinsic = await unsigned.signAsync(sender);
  console.log('signedExtrinsic toHex', signedExtrinsic.toHex());

  await api.disconnect()
}