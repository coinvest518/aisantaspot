import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FaEthereum, FaWallet } from 'react-icons/fa';
import { SiPolygon } from 'react-icons/si';
import { RiExchangeLine } from 'react-icons/ri';
import { useToast } from "@/hooks/use-toast";
import { recordDonation } from '../lib/donations'; // Import the donation tracking function

interface PaymentOption {
  amount: string;
  label: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    amount: "0.01",
    label: "Basic Support",
    description: "Small contribution to support the project"
  },
  {
    amount: "0.05",
    label: "Standard Support",
    description: "Help us grow and develop new features"
  },
  {
    amount: "0.1",
    label: "Premium Support",
    description: "Become a premium supporter with special benefits"
  }
];

const RECEIVER_WALLET = "YOUR_WALLET_ADDRESS_HERE"; // Replace with your wallet address

// Network configurations
const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
};

const CryptoPaymentPage = () => {
  const { toast } = useToast();
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string;
    gasPriceGwei: string;
    totalCost: string;
    networkFee: string;
  } | null>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [account, selectedNetwork]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask browser extension",
          variant: "destructive",
        });
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask browser extension",
          variant: "destructive",
        });
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected!",
      });
      const provider = new ethers.providers.Web3Provider(ethereum);
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (networkName: string) => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) return;

      const network = NETWORKS[networkName];
      setIsProcessing(true);

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        setSelectedNetwork(networkName);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
          setSelectedNetwork(networkName);
        }
      }
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const estimateGasForTransaction = async (amount: string) => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const amountInWei = ethers.utils.parseEther(amount);

      const gasPrice = await provider.getGasPrice();
      const gasLimit = await provider.estimateGas({
        to: RECEIVER_WALLET,
        value: amountInWei,
        from: account
      });

      const networkFee = gasPrice.mul(gasLimit);
      const totalCost = amountInWei.add(networkFee);

      setGasEstimate({
        gasLimit: gasLimit.toString(),
        gasPriceGwei: ethers.utils.formatUnits(gasPrice, 'gwei'),
        totalCost: ethers.utils.formatEther(totalCost),
        networkFee: ethers.utils.formatEther(networkFee)
      });
    } catch (error: any) {
      toast({
        title: "Gas Estimation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (amount: string) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      const amountInWei = ethers.utils.parseEther(amount);
      const userBalance = ethers.utils.parseEther(balance);
      
      if (userBalance.lt(amountInWei)) {
        throw new Error(`Insufficient balance. You need at least ${amount} ${
          selectedNetwork === 'polygon' ? 'MATIC' : 'ETH'
        }`);
      }

      setIsProcessing(true);
      const { ethereum } = window as any;
      
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      await estimateGasForTransaction(amount);
      
      if (!gasEstimate) {
        throw new Error("Failed to estimate gas");
      }

      const tx = await signer.sendTransaction({
        to: RECEIVER_WALLET,
        value: amountInWei,
        gasLimit: gasEstimate.gasLimit
      });

      toast({
        title: "Transaction Sent",
        description: "Please wait for confirmation...",
      });

      await tx.wait();

      // Record the donation in Supabase
      await recordDonation(account, parseFloat(amount), selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC', selectedNetwork);

      toast({
        title: "Payment Successful!",
        description: `Successfully sent ${amount} ${
          selectedNetwork === 'polygon' ? 'MATIC' : 'ETH'
        }`,
      });

      setSelectedAmount('');
      setCustomAmount('');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Payment Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Crypto Payments</h1>
          <p className="text-gray-400 text-xl">
            Support our project with cryptocurrency
          </p>
        </div>

        {/* Network Selection */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => switchNetwork('ethereum')}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
              selectedNetwork === 'ethereum' 
                ? 'bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <FaEthereum className="text-xl" />
            <span>Ethereum Network</span>
          </button>
          <button
            onClick={() => switchNetwork('polygon')}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
              selectedNetwork === 'polygon' 
                ? 'bg-purple-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <SiPolygon className="text-xl" />
            <span>Polygon Network</span>
          </button>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 
                       px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FaWallet className="text-xl" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-gray-800 px-6 py-3 rounded-lg">
              <FaWallet className="text-xl text-green-500" />
              <span>
                {`${account.substring(0, 6)}...${account.substring(
                  account.length - 4
                )}`}
              </span>
            </div>
          )}
        </div>

        {/* Wallet Status */}
        {account && (
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <FaWallet className="text-xl" />
              <span>{account ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
            </div>
            <div className="text-sm text-gray-400">
              Balance: {parseFloat(balance).toFixed(4)} {selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'}
            </div>
          </div>
        )}

        {/* Payment Options */}
        {account && (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {PAYMENT_OPTIONS.map((option, index) => (
              <div
                key={index}
                className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-transform 
                          hover:transform hover:scale-105 border-2 
                          ${
                            selectedAmount === option.amount
                              ? 'border-blue-500'
                              : 'border-transparent'
                          }`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {selectedNetwork === 'ethereum' ? (
                      <FaEthereum className="text-2xl text-blue-500" />
                    ) : (
                      <SiPolygon className="text-2xl text-purple-500" />
                    )}
                    <span className="text-2xl font-bold">
                      {option.amount} {selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{option.label}</h3>
                <p className="text-gray-400">{option.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gas Estimation Display */}
        {gasEstimate && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gas Price:</span>
                <span>{parseFloat(gasEstimate.gasPriceGwei).toFixed(2)} Gwei</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Gas Limit:</span>
                <span>{gasEstimate.gasLimit}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span>{parseFloat(gasEstimate.networkFee).toFixed(6)} {selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
                <span>Total Cost:</span>
                <span>{parseFloat(gasEstimate.totalCost).toFixed(6)} {selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Custom Amount */}
        {account && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-6 mb-12">
            <h3 className="text-xl font-semibold mb-4">Custom Amount</h3>
            <div className="flex space-x-4">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Enter ${selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'} amount`}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handlePayment(customAmount)}
                disabled={!customAmount || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg 
                         font-semibold transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Selected Amount Payment Button */}
        {account && selectedAmount && (
          <div className="text-center">
            <button
              onClick={() => handlePayment(selectedAmount)}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg 
                       font-semibold text-xl transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <span className="flex items-center space-x-2">
                  <RiExchangeLine className="text-2xl" />
                  <span>{`Pay ${selectedAmount} ${selectedNetwork === 'ethereum' ? 'ETH' : 'MATIC'}`}</span>
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPaymentPage;