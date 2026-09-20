# Protocol Governance

Arbitrage Inception is maintained as permissionless open-source software. The repository
does not identify a legal issuer or central governance body. The separate hosted
Protocol Community Rewards Service uses off-chain Redis accounting and an operational
hot signer, so it must not be described as fully decentralised or as an entirely
on-chain distribution mechanism.

## Smart Contract
The token contract (TaxableToken on BSCScan) was deployed with immutable parameters
set in the constructor. There are no admin functions, no owner privileges, and no
mechanism to change the taxWallet or taxPercentage after deployment. The contract
is fully verifiable on BSCScan.

## Frontend
Changes are proposed via Pull Requests. The codebase is MIT-licensed and anyone
can fork, deploy, and run their own instance.

## Treasury
The treasury and confirmed BNB payouts are on-chain and publicly verifiable where a
transaction is executed. Reward points, eligibility and pending balances are maintained
off-chain by the hosted service. The token contract has no disclosed administrative
function for changing its tax parameters; this does not remove operational risks from
the hosted rewards service or its signer.
