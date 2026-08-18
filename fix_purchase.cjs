const fs = require('fs');

// 1. Update GiftDetails.tsx
let giftDetails = fs.readFileSync('src/components/GiftDetails.tsx', 'utf8');

giftDetails = giftDetails.replace(/onSuccess: \(orderId: string, background\?: string\) => void;/g, 'onSuccess: (orderId: string, orderData?: any) => void;');
giftDetails = giftDetails.replace(/const randomBackground = gift.background \|\| BACKGROUNDS\[Math\.floor\(Math\.random\(\) \* BACKGROUNDS\.length\)\];/g, '');
giftDetails = giftDetails.replace(/api\.createOrder\(userId \|\| 'anonymous', gift, randomBackground\)/g, "api.createOrder(userId || 'anonymous', gift)");
giftDetails = giftDetails.replace(/onSuccess\(orderData\.orderId, randomBackground\)/g, "onSuccess(orderData.orderId, orderData)");

fs.writeFileSync('src/components/GiftDetails.tsx', giftDetails);

// 2. Update App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace(/const \[successBackground, setSuccessBackground\] = useState<string \| null>\(null\);/g, 'const [successOrderData, setSuccessOrderData] = useState<any>(null);');
appTsx = appTsx.replace(/const handlePurchaseSuccess = \(orderId: string, background\?: string\) => \{/g, 'const handlePurchaseSuccess = (orderId: string, orderData?: any) => {');
appTsx = appTsx.replace(/setSuccessBackground\(background \|\| null\);/g, 'setSuccessOrderData(orderData || null);');
appTsx = appTsx.replace(/setSuccessBackground\(null\);/g, 'setSuccessOrderData(null);');
appTsx = appTsx.replace(/background=\{successBackground\}/g, 'orderData={successOrderData}');

fs.writeFileSync('src/App.tsx', appTsx);
