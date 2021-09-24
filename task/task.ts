import {task} from 'hardhat/config';

const proxyAdminAddr = '0x9F8BB5B06b000f007d0E3e5A744e6f50dB4FE519';
const proxyFactoryAddr = '0x8b5Df08Dad51bC2f0B343f26448C1e038e37B73c';

task('deploy-proxy-factory', 'Deploy Proxy Factory').setAction(async (__, {ethers, network}) => {
    const ProxyFactory = await ethers.getContractFactory('ProxyFactory');
    const proxyFactory =  await ProxyFactory.deploy({
        gasLimit: 1000000,
        gasPrice: 1000000009
    });
    await proxyFactory.deployed();
    console.log('proxyFactory', proxyFactory.address);
    if (network.name !== 'mainnetfork') {
        return;
    }
    await proxyFactory.build(
        proxyFactory.address,
        '0x9F8BB5B06b000f007d0E3e5A744e6f50dB4FE519',
        '0x'
    );
});

task('deploy-matrix-pool', 'deploy MatrixPool')
    .setAction(async (taskArgs, {ethers}) => {
        const MatrixPool = await ethers.getContractFactory('MatrixPool');
        const Impl = await MatrixPool.deploy({
            gasLimit: 8000000,
            gasPrice: 1000000009,
        });
        const impl = await Impl.deployed();
        console.log('pool address', impl.address);
    });

task('deploy-matrix-pool-factory-and-action', 'deploy MatrixPool factory and action')
    .addParam('pool')
    .setAction(async (taskArgs, {ethers}) => {
        const MatrixPoolFactory = await ethers.getContractFactory('MatrixPoolFactory');
        const bFactory = await MatrixPoolFactory.deploy(proxyFactoryAddr, taskArgs.pool, proxyAdminAddr);
        const factory = await bFactory.deployed();
        console.log('bFactory', factory.address);

        const MatrixPoolActions = await ethers.getContractFactory('MatrixPoolActions');
        const BActions = await MatrixPoolActions.deploy();
        console.log('bActions', BActions.address);
    });

task('create-pool-in-action', 'create pool in action')
    .addParam('factory')
    .addParam('action')
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const deploy = signers[0];
        const bFactory = await ethers.getContractAt('MatrixPoolFactory', taskArgs.factory, deploy);
        const bActions = await ethers.getContractAt('MatrixPoolActions', taskArgs.action, deploy);
        const utils = ethers.utils;

        const poolConfig = {
            initialValue: 1,
            initialSupply: 100,
            name: 'Matrix ETF+',
            symbol: 'ETF+',
            tokens: [
                {address: '0xfec7c59122235bbbae3c455ac4fb6f95d98c879d', denorm: 25, value: 100},   //BTC0
                {address: '0x8d46e6e53681eff9e74294f94caacf2f6c610916', denorm: 15, value: 20},   //ETH0
                {address: '0xc8473d4de765b32f1b5fb165cdb13babc6c2bfb2', denorm: 10, value: 5},   //SOL0
            ],
            swapFee: '0.002',
            communitySwapFee: '0.003',
            communityJoinFee: '0.003',
            communityExitFee: '0.007',
            communityFeeReceiver: '0xEc5d3C6a9763FE1596aB6EFCFA319fc9F540A6B3'
        };

        for (const item of poolConfig.tokens) {
            const token = await ethers.getContractAt('MockERC20', item.address, deploy);
            const balance = await token.balanceOf(deploy.address);
            console.log('approve', token.address, balance.toString());
            await token.approve(bActions.address, balance);
        }
        await bActions.create(
            bFactory.address,
            poolConfig.name,
            poolConfig.symbol,
            {
                minWeightPerSecond: utils.parseUnits('0'),
                maxWeightPerSecond: utils.parseUnits('1'),
                swapFee: utils.parseUnits(poolConfig.swapFee),
                communitySwapFee: utils.parseUnits(poolConfig.communitySwapFee),
                communityJoinFee: utils.parseUnits(poolConfig.communityJoinFee),
                communityExitFee: utils.parseUnits(poolConfig.communityExitFee),
                communityFeeReceiver: poolConfig.communityFeeReceiver,
                finalize: true
            },
            poolConfig.tokens.map((token, index) => ({
                token: token.address,
                balance: utils.parseUnits(((poolConfig.initialValue / token.value) * (token.denorm / 100) * poolConfig.initialSupply).toString()),
                targetDenorm: utils.parseUnits(token.denorm + ''),
                fromTimestamp: '1632377700',
                targetTimestamp: '1632378000'
            })),
            {
                gasLimit: 3000000,
                gasPrice: 1000000009
            },
        );
    });

task('set-fee', 'set fee')
    .addParam('pool')
    .setAction(async (taskArgs, {ethers}) => {
    });

module.exports = {};
