import React from 'react';
import CIDRUtils from './CIDRUtils';
import './App.css';

function App() {
  const cidrUtils = new CIDRUtils()
  const starterCidr = '10.0.1.0/23'
  const [ipspace, setIpspace] = React.useState(starterCidr)
  const [ipresults, setIpresults] = React.useState(cidrUtils.range(starterCidr))
  const [numnodes, setNumnodes] = React.useState(3)
  const [nodecpu, setNodecpu] = React.useState(2)
  const [nodemem, setNodemem] = React.useState(7)
  const [maxPodsPerNode, setMaxPodsPerNode] = React.useState(0)
  const [avgPodCpu, setAvgPodCpu] = React.useState(0)
  const [avgPodMem, setAvgPodMem] = React.useState(0)

  const handleIpSpaceChange = (e) => {
    console.log(e.target.value)
    setIpspace(e.target.value);
    try{
      let rangeresults = cidrUtils.range(e.target.value)
      setIpresults(rangeresults)
    }catch(e){
      setIpresults( { error: 'INVALID CIDR' } )
    }
  }

  const handleNumnodesChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setNumnodes(parseInt(e.target.value));
    }else {
      setNumnodes('');
    }
    
  }

  const handleNodecpuChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setNodecpu(parseInt(e.target.value));
    }else{
      setNodecpu('')
    }
  }

  const handleNodememChange =  (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setNodemem(parseInt(e.target.value));
    }else{
      setNodemem('')
    }
  }

  React.useEffect( () => {
    console.log(`Num Nodes: ${numnodes}`)
    console.log(numnodes + nplusone)
    console.log(`IP Available: ${ipresults.ipAvailable}`)
    console.log(`IP Available Post: ${ipresults.ipAvailable - azurereservedips - (numnodes + nplusone)}`)
    let maxPods = Math.floor((ipresults.ipAvailable - azurereservedips - (numnodes + nplusone)) / (numnodes + nplusone))
    console.log(maxPods)
    setMaxPodsPerNode(maxPods)
    setAvgPodCpu(nodecpu / maxPods)
    let podMem = nodemem / maxPods
    let podMemStr = `${podMem} GB`
    if ( podMem < 1){
      podMemStr = `${podMem * 1024} MB`
    }

    setAvgPodMem(podMemStr)
  }, [ipresults, numnodes, nodecpu, nodemem])
  
  
  //const kubesystempods = 18
  const nplusone = 1
  const azurereservedips = 5

  return (
    <div className="App">
      <h1>AKS Planning Calculator</h1>
      <fieldset>
        <legend>Nodes</legend>
        <label htmlFor="numnodes">Number of Nodes:</label>
        <input type="text" name="numnodes" onChange={handleNumnodesChange} value={numnodes} />
        <label htmlFor="nodecpu">Node vCPU(s):</label>
        <input type="text" name="nodecpu" onChange={handleNodecpuChange} value={nodecpu} />
        <label htmlFor="nodemem">Node RAM (GB):</label>
        <input type="text" name="nodemem" onChange={handleNodememChange} value={nodemem} />
        <a href="https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/">Azure Instance Sizes</a>
      </fieldset>
      <fieldset>
        <legend>Network</legend>
        <label htmlFor='ipspace'>Subnet CIDR:</label>
        <input type="text" onChange={handleIpSpaceChange} name="ipspace" value={ipspace}/>
        <div>
          <p>{ (ipresults.error) ? <span className='error'>{ ipresults.error }</span> : <span>{ipresults.ipMin} - {ipresults.ipMax} ({ipresults.ipAvailable - azurereservedips}  + {azurereservedips} Azure reserved addresses)</span> }</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Pods</legend>
        <p>Max number of pods per node: { maxPodsPerNode } (Accounting for N+1 for upgrades)</p>
        <p>Average vCPU per pod: {avgPodCpu}</p>
        <p>Average RAM per pod: {avgPodMem}</p>
      </fieldset>
    </div>
  );
}

export default App;
