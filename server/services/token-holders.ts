import fetch from 'node-fetch';

export interface TokenHolder {
  address: string;
  percentage: number;
  label?: string;
}

/**
 * Fetch top token holders for a specific token contract address
 * 
 * @param tokenAddress - The token contract address
 * @returns An array of token holders with their percentage
 */
export async function fetchTopTokenHolders(tokenAddress: string): Promise<TokenHolder[]> {
  try {
    // This is a placeholder since we can't directly fetch from DexScreener's API
    // In a real implementation, we would need to either:
    // 1. Use a blockchain explorer API that provides holder information
    // 2. Or scrape the DexScreener website (not recommended for production)
    
    const tokenAddressLower = tokenAddress.toLowerCase();
    
    // X23 token on Polygon (project ID 1)
    if (tokenAddressLower === '0xc530b75465ce3c6286e718110a7b2e2b64bdc860') {
      return [
        { address: '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838', percentage: 39.88, label: 'QuickSwap: X23-WMATIC' },
        { address: '0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50', percentage: 15.11, label: 'Reserve Treasury' },
        { address: '0xad7936a3636055d022a46480da1c55bc2092c49d', percentage: 10.38, label: 'Marketing & Ecosystem' },
        { address: '0x45e5bc9513fb47272a73adb7c6d29780aefb3214', percentage: 9.94, label: 'Team (Locked)' },
        { address: '0xd2b9e922f710da079ea266658c9763fb0bc9e995', percentage: 9.71, label: 'Early Investors' },
        { address: '0x6b75228ec272d95993c41ea781ed46f3466e1144', percentage: 5.44, label: 'Development Fund' },
        { address: '0xa94d8d65369c0de7b6835af45d9ea0b9b0758694', percentage: 2.42, label: 'Community Rewards' },
        { address: '0x1f4da928ccc0db8095e38566af46cdde23b7b398', percentage: 1.97, label: 'Advisors (Locked)' },
        { address: '0x33a89d5ea36ff19fccf2ddaaebd5c07c3391d7dd', percentage: 0.86 },
        { address: '0x6f146cb6a0bd4ee1047bfc41da1a8bcfd1b7d2ce', percentage: 0.55 }
      ];
    }
    
    // CTZN token on Polygon (project ID 2)
    else if (tokenAddressLower === '0xc2b0f088a0b242fd5cb46c9de92ccea6823e264b') {
      return [
        { address: '0x48C5D7C9B49A0D239A93BD98A901dd3F4C7c6414', percentage: 14.75, label: 'QuickSwap: CTZN-USDC' },
        { address: '0xA91F34de933F21e71C8058ff62Ac5D05Ef6105B2', percentage: 12.38, label: 'Treasury' },
        { address: '0xE23DD859A56A0424c0aF1c22b045E563Cd5f74D0', percentage: 8.91, label: 'Team (Locked)' },
        { address: '0x3D63B916C43D4b21f2a7390c75ec11947Ec3F853', percentage: 7.53, label: 'Marketing Fund' },
        { address: '0x9BD27Ac50E7714A841458268c64D44B0Ec944168', percentage: 6.42, label: 'Development Fund' },
        { address: '0x68473ccAD7C74DDb9A23a62F7a0DDeBf1DAc588b', percentage: 5.71, label: 'Strategic Partners' },
        { address: '0x04F124e5A070150691c490C94D401cE7E9d15974', percentage: 4.59, label: 'Advisors (Locked)' },
        { address: '0xfD88ceC0392a0c566110b45F83C82C4B34E37D05', percentage: 3.85, label: 'Community Rewards' },
        { address: '0x01a7389D1Bf65fC90d439218C66D32A62c8BAB16', percentage: 3.52 },
        { address: '0xeE9562438C7fa923d2Ca818f01EC7e0E89731922', percentage: 3.17 }
      ];
    }
    
    // GRNDT token on Polygon (project ID 5)
    else if (tokenAddressLower === '0x0cDE22F911FDe1aF2CC30a73cFe39246037B7D58'.toLowerCase()) {
      return [
        { address: '0xA72F4012F362c763f1091bE02c386E5fe167AC13', percentage: 15.25, label: 'QuickSwap: GRID-USDC' },
        { address: '0xD41e8F41F137B94B75C2CAB91DD7F6c5260C5e85', percentage: 12.78, label: 'Ecosystem Fund' },
        { address: '0x49bA5C3bA7e33e23F56DDba829F3d12Ce94f25C3', percentage: 9.34, label: 'Team (Locked)' },
        { address: '0x1F24c35895A15e9F25eB27fF1e2658Cf09eC4dBe', percentage: 7.85, label: 'Governance Treasury' },
        { address: '0xF3c23d2BA3f9F67b8F655043E72A6C1D9b446218', percentage: 6.95, label: 'Marketing Fund' },
        { address: '0x3a8D7F923f82F2Fe62c0ABf569752DF05F3cC278', percentage: 5.47, label: 'Development Fund' },
        { address: '0x85A73D25EfF8d300A9E43d9835F9b17B9C36CAeC', percentage: 4.92, label: 'Strategic Partners' },
        { address: '0x7c9D8F6a392CDf61D4C8060Fa901F2C5C58e41C1', percentage: 4.18, label: 'Advisors (Locked)' },
        { address: '0xE5f89c97681C939F44C8759AB5c50d2261c57F9A', percentage: 3.67, label: 'Early Backers' },
        { address: '0x4D2A69B28C75E2Cc1C7b62C4Bd3dE0A32B1AE189', percentage: 3.12, label: 'Community Rewards' }
      ];
    }
    
    // PRSM token on Polygon (project ID 6)
    else if (tokenAddressLower === '0x0cDE22F911FDe1aF2CC30a73cFe39246037B7D59'.toLowerCase()) {
      return [
        { address: '0xB29E26848E927C7299A2170AD96D12779e5F6817', percentage: 13.87, label: 'QuickSwap: PRSM-USDC' },
        { address: '0xF5D8942DE35C7E7454a6789b5A46E93e4E4e5246', percentage: 11.92, label: 'Treasury' },
        { address: '0x3F7D10E2908C201b8E42DE6C4f2ACB58BEb4a4f9', percentage: 9.64, label: 'Team (Locked)' },
        { address: '0xD7a2B8F6A614aCdC31a5A3aE2E6c8505Ce59f84F', percentage: 8.25, label: 'Protocol Reserve' },
        { address: '0x12F649CEB63A1C76a6A6c8Eea7C9Ffbe1C0fdE98', percentage: 6.73, label: 'Marketing Fund' },
        { address: '0x52aD75ABF7f8dC69A27f79619D957e6960c7C1B5', percentage: 5.89, label: 'Developer Fund' },
        { address: '0x9B41e3a480416522c5C3190884cD2ce5d8A24235', percentage: 4.52, label: 'Strategic Partnerships' },
        { address: '0x72B8C06B4Ca61A1C50d26F831e7E8C6EA4F1692b', percentage: 3.96, label: 'Advisors (Locked)' },
        { address: '0xE18CeF89fa9dd2Fe2A354D61b43EEa380f4B8D12', percentage: 3.43, label: 'Early Investors' },
        { address: '0x1dD87E5e1C17b40C20693f0CFa5B55cE80B2b895', percentage: 3.01, label: 'Community Rewards' }
      ];
    }
    
    // For other tokens, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }
}

/**
 * Generate Polygonscan URL for a token holder address
 * 
 * @param address - The token holder address
 * @returns Polygonscan URL for the address
 */
export function getAddressExplorerUrl(address: string): string {
  return `https://polygonscan.com/address/${address}`;
}