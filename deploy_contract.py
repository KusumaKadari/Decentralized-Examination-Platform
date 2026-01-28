"""
Script to compile and deploy the Question smart contract to Ganache
"""
import json
from solcx import compile_source, install_solc
from web3 import Web3

# Install solidity compiler
print("Installing Solidity compiler...")
install_solc('0.8.11')

# Connect to Ganache
print("Connecting to Ganache...")
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:9545'))

if not w3.is_connected():
    print("ERROR: Cannot connect to Ganache at http://127.0.0.1:9545")
    print("Make sure Ganache is running on port 9545")
    exit(1)

print(f"Connected! Chain ID: {w3.eth.chain_id}")
print(f"Accounts available: {len(w3.eth.accounts)}")

# Set default account
w3.eth.default_account = w3.eth.accounts[0]
print(f"Using account: {w3.eth.default_account}")

# Read the Solidity contract
print("Reading contract...")
with open('Question.sol', 'r') as file:
    contract_source = file.read()

# Compile the contract
print("Compiling contract...")
compiled_sol = compile_source(
    contract_source,
    output_values=['abi', 'bin'],
    solc_version='0.8.11'
)

# Get contract interface
contract_id, contract_interface = compiled_sol.popitem()
bytecode = contract_interface['bin']
abi = contract_interface['abi']

# Deploy the contract
print("Deploying contract...")
Question = w3.eth.contract(abi=abi, bytecode=bytecode)

# Submit the transaction that deploys the contract
tx_hash = Question.constructor().transact()
print(f"Transaction hash: {tx_hash.hex()}")

# Wait for the transaction to be mined
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = tx_receipt.contractAddress
print(f"\n{'='*50}")
print(f"CONTRACT DEPLOYED SUCCESSFULLY!")
print(f"Contract Address: {contract_address}")
print(f"{'='*50}\n")

# Save the contract ABI and address to a JSON file
contract_data = {
    'abi': abi,
    'address': contract_address
}

with open('Question.json', 'w') as f:
    json.dump(contract_data, f, indent=2)

print("Contract ABI and address saved to Question.json")
print(f"\nUpdate views.py line 25 with this address:")
print(f"deployed_contract_address = '{contract_address}'")
