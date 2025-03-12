import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as agentTokenAbi } from "../artifacts/contracts/virtualPersona/AgentToken.sol/AgentToken.json";
import { vars } from "hardhat/config";

const agentTokenAddress = "0xD409D8435e706acfede45089A4AEDbaBD570F085";
async function main() {
  const provider = new JsonRpcProvider("https://rpc-testnet.defi-verse.org/");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);

  console.log("signer address", signer.address);

  const agnetTokenCall = new ethers.Contract(
    agentTokenAddress,
    agentTokenAbi,
    signer
  );
  const basisBuy = await agnetTokenCall.projectBuyTaxBasisPoints();
  console.log("basisBuy, should divided by 10000", basisBuy);

  const basisSell = await agnetTokenCall.projectSellTaxBasisPoints();
  console.log("basisSell, should divided by 10000", basisSell);

  const taxRecipient = await agnetTokenCall.projectTaxRecipient();
  console.log("taxRecipient", taxRecipient);

  const taxPendingSwapBefore = await agnetTokenCall.projectTaxPendingSwap();
  console.log("before taxPendingSwap", taxPendingSwapBefore);

  const distributeTaxTokens = await agnetTokenCall.distributeTaxTokens();
  await distributeTaxTokens.wait();
  console.log("distributeTaxTokens success");

  const taxPendingSwapAfter = await agnetTokenCall.projectTaxPendingSwap();
  console.log("after taxPendingSwap should be 0", taxPendingSwapAfter);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
