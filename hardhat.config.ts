import '@nomiclabs/hardhat-waffle'

require('dotenv').config();
require('./task/task');

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

const config = {
    defaultNetwork: 'hardhat',
    networks: {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: [
                process.env.MAINNET_PRIVATE_KEY || ''
            ].filter((item) => item !== '')
        },
        kovan: {
            url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: [
                process.env.KOVAN_PRIVATE_KEY || '',
                process.env.KOVAN_PRIVATE_KEY1 || '',
            ].filter((item) => item !== '')
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
            blockGasLimit: 12000000,
            gas: 21000000,
            gasPrice: 2000000000,
            accounts: [
                process.env.RINKEBY_PRIVATE_KEY || '',
                process.env.RINKEBY_PRIVATE_KEY1 || ''
            ].filter((item) => item !== '')
        },
        frame: {
            url: 'http://localhost:1248'
        }
    },
    solidity: {
        settings: {
            optimizer: {
                enabled: true,
                runs: 2,
            },
        },
        version: '0.6.12',
    },
    etherscan: {apiKey: ETHERSCAN_API_KEY}

}
module.exports = config;
