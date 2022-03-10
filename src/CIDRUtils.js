import IpSubnetCalculator from 'ip-subnet-calculator'

function isNumber(n){
    try {
        let pi = parseInt(n)
        console.log('is a number: ' + pi)
        return !isNaN(pi)
    }catch(e){
        console.log('NOT A NUMBER: ' + n)
        return false
    }
}

function do_validation(cidr){
    const cidrsplit = cidr.split('/')
    if (cidrsplit.length !== 2 
        || !IpSubnetCalculator.isIp(cidrsplit[0])
        || !isNumber(cidrsplit[1])) {
        throw new Error('Invalid CIDR')
    }
}
function CIDRUtils(){
    return {
        validate: (cidr) => {
            do_validation(cidr)
        },
        range: (cidr) => {
            do_validation(cidr)
            
            const [ipspace, mask] = cidr.split('/')
            const calcSubnet = IpSubnetCalculator.calculateSubnetMask(ipspace, mask)
            return { 
                'ipMin': calcSubnet.ipLowStr,
                'ipMax': calcSubnet.ipHighStr,
                'ipAvailable': (calcSubnet.ipHigh - calcSubnet.ipLow)+1 
            } //[ JSON.stringify(calcSubnet, null, 2), (calcSubnet.ipHigh - calcSubnet.ipLow)+1  ]

        }
    }
}

export default CIDRUtils;