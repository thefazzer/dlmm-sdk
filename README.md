# DLMM-SDK Setup and Testing Guide for Deltalon Integration

This guide provides comprehensive instructions for setting up and testing the DLMM-SDK for Deltalon integration.

## Table of Contents
- [Initial Setup](#initial-setup)
- [Running Tests](#running-tests)
- [Mainnet Configuration](#mainnet-configuration)
- [Validator Status](#validator-status)
- [Repository Management](#repository-management)
- [SSH Configuration](#ssh-configuration)
- [Solana Bot Activity](#solana-bot-activity)
- [Analytics Package Overview](#analytics-package-overview)
  - [QuoteCollector](#quotecollector)
  - [VolatilityCalculator](#volatilitycalculator)
  - [OrderFlow](#orderflow)

## Initial Setup

Clone the repository and navigate to the TypeScript client directory:

```bash
git clone https://github.com/thefazzer/dlmm-sdk.git
cd dlmm-sdk/ts-client
```

Start the local Anchor environment with the localnet feature:

```bash
anchor localnet -- --features localnet
```

## Running Tests

Install dependencies and run the test suite:

```bash
cd dlmm-sdk/ts-client
npm install -g pnpm
pnpm install
pnpm list jest || pnpm add -D jest
pnpm run test
```

## Mainnet Configuration

Verify that you're running against mainnet:

```bash
solana config get
```

Expected output:

```bash
Config File: /root/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
Keypair Path: /root/.config/solana/id.json
Commitment: confirmed
```

## Validator Status

Check the validator status with these commands:

```bash
solana slot
solana block-production
solana catchup --our-localhost
```

**Important:** Compare the tail block with Solscan to ensure synchronization.

## Repository Management

Open VSCode and configure your Git remotes:

```bash
git remote -v
git remote remove origin
git remote add origin git@bitbucket.org:deltalon/dlmm-sdk.git
git remote add upstream https://github.com/thefazzer/dlmm-sdk.git
```

## SSH Configuration

Test your Bitbucket connection:

```bash
ssh -T git@bitbucket.org
```

Copy SSH keys between Docker containers:

```bash
docker cp 014b6cdf4193:/root/.ssh ~/.ssh
docker cp ~/.ssh 3951f82e1c49:/root/.ssh
```

## Solana Bot Activity

Monitor Solana bot activity at:

**[Datadog Dashboard](#)**

## Analytics Package Overview

### QuoteCollector
Sanitizes, interpolates, and analyzes financial quote streams, ensuring data integrity before further processing.

### VolatilityCalculator
- **Configuration:** Uses predefined time windows and requires a minimum number of price samples for calculations.
- **Data Validation:** Ensures all prices are finite, checks for minimum required samples, and prevents negative or zero window durations.
- **Normalization:** Converts price data into logarithmic returns to normalize percentage changes.
- **Volatility Computation:** Uses the square root of variance (standard deviation) as the volatility measure.

🚀 **Key Takeaway:** Transforms raw price data into a volatility measure, ensuring robustness against data errors and providing risk analysis insights.

### OrderFlow
- **Buy & Sell Volume Tracking**
  - Stores the most recent trades up to `historySize` (default 300 trades ≈ 5 minutes).
  - Manages a FIFO queue, removing oldest trades when capacity is reached.
- **Trade Processing (`addTrade`)**
  - Handles incoming trades by aggressor (Buyer or Seller).
  - Maintains trades history:
    - Adds trade size to `buyVolume` or `sellVolume` based on `isBuyer`.
    - Removes oldest volume entry when `historySize` is exceeded.
- **Order Flow Imbalance Calculation**
  - **Purpose:** Measures market dominance between buyers & sellers within a given time window.
  - **Formula:** `imbalance = (buyVolume - sellVolume) / (buyVolume + sellVolume)`
- **Additional Features**
  - VWAP (Volume-Weighted Average Price) calculation.

---
This documentation is maintained by the Deltalon team. For questions or support, please contact the repository maintainers.

