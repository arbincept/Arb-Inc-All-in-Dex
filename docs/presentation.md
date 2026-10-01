# Sharing assets and repository discovery

## Social card

- Export: [social-preview.png](../public/social-preview.png), **1280×640 PNG, below 1 MB**.
- Editable source: [social-preview.html](social-preview.html).
- Existing asset: [public/logo.jpg](../public/logo.jpg), reused from this repository. No new logo or third-party stock image was introduced.
- Palette: the project's dark background and purple accent, with warm gold from the existing logo.
- Signature: **by Lukecele**. Message: **Swap, bridge, and explore DeFi.**
- The card has an opaque background so its text retains contrast on light and dark sharing surfaces.

To reproduce, serve the repository locally, open `docs/social-preview.html` in a browser at a **1280×640 viewport**, wait for the logo to load and save a PNG viewport screenshot as `public/social-preview.png`. No remote font or image request is needed. At smaller viewport widths the HTML scales the complete canvas for inspection; always export at 1280×640.

Uploading a PNG to the repository does **not** configure GitHub's social preview or change the live application's Open Graph metadata. See [GitHub's social-preview instructions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).

## Repository settings: prepared, not applied

The task's GitHub CLI rejected the metadata update with `CODERABBIT_AGENT_RUNTIME_OWNS_GIT_DELIVERY` (exit 89). About and Topics remain unchanged. The homepage already matches the requested URL. Social-preview upload was not performed; no supported authenticated settings interface was available in this task.

Complete these operations in this repository only:

1. On the [repository page](https://github.com/arbincept/Arb-Inc-All-in-Dex), open **About → Edit repository metadata** and set the description to:

   > Open-source DEX aggregator, cross-chain bridge and limit-order interface on BNB Chain. Built by Lukecele.

2. Keep the homepage as `https://arbitrage-inc.exchange`.
3. Replace the current topics with exactly:

   ```text
   defi dex-aggregator cross-chain bnb-chain evm solana kyberswap mayan-finance limit-orders nextjs typescript pwa
   ```

   This removes `mev` and the other superseded labels. The 12 proposed topics meet [GitHub's current topic limits](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics): at most 20, at most 50 characters per topic, lowercase letters/numbers/hyphens.
4. Open **Settings → General → Social preview → Edit → Upload an image**, choose `public/social-preview.png`, and confirm the preview. GitHub recommends 1280×640 and requires an image smaller than 1 MB.

### Evidence for the proposed topics

| Topics | Repository evidence |
| :--- | :--- |
| `defi`, `dex-aggregator`, `bnb-chain`, `kyberswap` | [Swap interface](../app/swap-all/BetaSwapClient.tsx), [token and chain constants](../lib/swap/constants.ts), [Kyber API proxy](../app/api/kyber/swap/route.ts). |
| `cross-chain`, `evm`, `solana`, `mayan-finance` | [Bridge configuration](../app/bridge/ClientWrapper.tsx) explicitly lists BSC, Ethereum, Arbitrum, Polygon, Base, Avalanche and Solana. |
| `limit-orders` | [Limit-order page](../app/limit-orders/page.tsx) and [wallet signing implementation](../lib/limit-order/signing.ts). |
| `nextjs`, `typescript` | [Package manifest](../package.json). |
| `pwa` | [Standalone web manifest](../public/manifest.json). |

## Demo and announcement

- [Demo status and 24-second storyboard](demo.md): a live quote capture remains pending; the supplied video is labelled as a storyboard.
- [Technical announcement draft](announcement.md): English text ready to copy, not published.

The existing README fee disclosures, provider dependencies and distinction between wallet trading and hosted reward payouts remain in place. No claim of guaranteed execution, profit, MEV immunity or a completed manual audit is added by these assets.
