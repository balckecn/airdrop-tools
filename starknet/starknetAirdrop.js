const { Contract, Account, RpcProvider, uint256 } = require("starknet");

// 需要领取空投的账户,privateKey(私钥) accountAddress(账户地址)
var accounts = [
    {
        privateKey: '私钥1',
        accountAddress: '账户地址1'
    },
    {
        privateKey: '私钥2',
        accountAddress: '账户地址2'
    }
]

// 提供者列表，可自行添加，或修改对应的节点地址，修改nodeUrl即可
const providers = [
    new RpcProvider({ nodeUrl: 'node url1' }),
    new RpcProvider({ nodeUrl: 'node url2' })
];


// 需要转账的代币的token地址和abi地址 以以太坊为例
const tokenAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
// 注意，这个abi地址，如果代币的合约有代理合约，那么这个abi地址就是代理合约的地址
const tokenAbiAddr = '0x048624e084dc68d82076582219c7ed8cb0910c01746cca3cd72a28ecfe07e42d';

// claimAddr，这里的地址和token的地址一样，如果claim合约是代理合约，那么这里的地址就是代理合约的地址
const claimAddr = '';

// 发送的目标地址
const targetAddr = '';



//-----------------------以下为函数-----------------------//
// 测试用的，获取代币余额
const getBalance = async (abiAddr, caAddr, account, provider) => {
    try {
        const { abi: ercABI } = await provider.getClassAt(abiAddr);
        if (ercABI === undefined) { throw new Error("no abi.") };
        const erc20 = new Contract(ercABI, caAddr, provider);
        const { balance } = await erc20.balanceOf(account.address);
        console.log(BigInt(balance.low).toString())
    } catch (error) {
        console.log(error.message)
    }
}

// claim代币的方法
const claim = async () => {
    // 暂时不清楚claim的合约，所以先不写
}

// 归集转账的方法
const transfer = async (account, provider) => {
    try {
        // 1、通过abi地址获取abi
        const { abi: ercABI } = await provider.getClassAt(tokenAbiAddr);
        if (ercABI === undefined) { throw new Error("no abi.") };
        // 2、构建合约对象
        const erc20 = new Contract(ercABI, tokenAddr, provider);
        // 3、将合约对象连接到账户
        erc20.connect(account);
        // 4、获取当前代币余额
        const { balance } = await erc20.balanceOf(account.address);
        // 5、将所有代币转账到目标地址
        erc20.transfer(targetAddr, uint256.bnToUint256(BigInt(balance.low)));
    }
    catch (error) {
        console.log(error.message)
    }
}

const task = async (value, i) => {
    const privateKey = value.privateKey;
    const accountAddress = value.accountAddress;

    // provider根据循环的i使用%来选择,防止单个provider被封
    let provider = providers[i % providers.length];

    // 1、生成需要归集的account
    const account = new Account(provider, accountAddress, privateKey);

    // 2、调用claim脚本
    claim();

    // 3、代币统一转账
    transfer(account, provider);
}

function main() {
    for (let i = 0; i < accounts.length; i++) {
        task(accounts[i], i);
    }
}

main();
