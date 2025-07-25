import React, { useState } from "react";
import { ethers } from "ethers";
import { BITE } from "@skalenetwork/bite";
import "./App.css";

// MyToken ABI - Feel free to expand it as necessary
const MyTokenABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // Configuration
  const CONTRACT_ADDRESS = "0x437F581d7C3472a089AAd0D1b53cef5DC72C7d6E";
  const RECIPIENT_ADDRESS = "0xcE7E58D645655CB7B573Fa3B161F344e210Dd2c8";
  const AMOUNT = "1";
  const FAIR_RPC_URL =
    "https://testnet-v1.skalenodes.com/v1/idealistic-dual-miram";

  // Add your private key here (make sure to keep it secure!)
  const PRIVATE_KEY = ""; // Replace with your actual private key

  const handleMint = async () => {
    if (!PRIVATE_KEY || PRIVATE_KEY === '') {
      setStatus("Please add your private key to the PRIVATE_KEY on line 41");
      return;
    }

    setLoading(true);
    setStatus("Preparing mint transaction...");
    setTxHash("");

    try {
      // Create provider and wallet
      const provider = new ethers.JsonRpcProvider(FAIR_RPC_URL);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

      console.log("Minting with account:", wallet.address);
      setStatus(`Minting with account: ${wallet.address}`);

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyTokenABI,
        wallet
      );

      // Encode the function data
      const data = contract.interface.encodeFunctionData("mint", [
        RECIPIENT_ADDRESS,
        ethers.parseUnits(AMOUNT,18),
      ]);

      // Initialize BITE
      const bite = new BITE(FAIR_RPC_URL);

      // Create transaction object
      const transaction = {
        to: CONTRACT_ADDRESS,
        data: data,
      };

      setStatus("Encrypting transaction with BITE...");

      // Encrypt the transaction using BITE
      const encryptedTx = await bite.encryptTransaction(transaction);

      console.log("Encrypted transaction:", encryptedTx);

      setStatus("Sending encrypted transaction...");

      // Send the encrypted transaction
      const tx = await wallet.sendTransaction({
        ...encryptedTx,
        value: 0,
        gasLimit: 100000,
      });

      setStatus(`Transaction sent! Hash: ${tx.hash}`);
      setTxHash(tx.hash);

      console.log("Transaction hash:", tx.hash);

      // Wait for transaction to be mined
      setStatus("Waiting for transaction to be mined...");
      const receipt = await tx.wait();

      console.log("Transaction receipt:", receipt);
      setStatus(
        `✅ Mint successful! Transaction mined in block ${receipt?.blockNumber}`
      );
    } catch (error) {
      console.error("Mint failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BITE Mint Token DApp (Vite/React)</h1>

        <div style={{ margin: "20px 0", textAlign: "left" }}>
          <h3>Configuration:</h3>
          <p>
            <strong>Contract:</strong> {CONTRACT_ADDRESS}
          </p>
          <p>
            <strong>Recipient:</strong> {RECIPIENT_ADDRESS}
          </p>
          <p>
            <strong>Amount:</strong> {AMOUNT}
          </p>
          <p>
            <strong>Network:</strong> FAIR Testnet
          </p>
        </div>

        <button
          onClick={handleMint}
          disabled={loading}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            margin: "20px 0",
          }}
        >
          {loading ? "Minting..." : "Mint ERC-20 Token"}
        </button>

        {status && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              color: "#333",
              maxWidth: "600px",
              wordBreak: "break-all",
            }}
          >
            <h4>Status:</h4>
            <p>{status}</p>
          </div>
        )}

        {txHash && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              color: "#333",
              maxWidth: "600px",
              wordBreak: "break-all",
            }}
          >
            <h4>Transaction Hash:</h4>
            <a
              href={`https://idealistic-dual-miram.explorer.testnet-v1.skalenodes.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1a0dab", textDecoration: "underline" }}
            >
              {txHash}
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
