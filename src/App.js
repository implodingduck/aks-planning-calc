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
  const [memunit, setMemunit] = React.useState(1024)

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

  const handleNodememChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setNodemem(parseInt(e.target.value));
    }else{
      setNodemem('')
    }
  }

  const handleMemunitChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setMemunit(parseInt(e.target.value))
    }else{
      setMemunit('')
    }
  }

  const handleMaxpodspernodeChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      console.log('Changing to: ' + e.target.value)
      setMaxPodsPerNode(parseInt(e.target.value))
    }else{
      setMaxPodsPerNode('')
    }
  }
  
  const handleAvgpodcpuChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setAvgPodCpu(parseFloat(e.target.value))
      setNodecpu( parseFloat(e.target.value) * maxPodsPerNode )
    }else{
      setAvgPodCpu('')
    }
  }

  const handleAvgpodmemChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setAvgPodMem(parseFloat(e.target.value))
      setNodemem( parseFloat(e.target.value) * maxPodsPerNode )
    }else{
      setAvgPodMem('')
    }
  }

  const computeTotalMaxPods = React.useCallback(() => {
    return Math.floor((ipresults.ipAvailable - azurereservedips - (numnodes + nplusone)) / (numnodes + nplusone))
  }, [ipresults, numnodes])

  React.useEffect( () => {
    let maxPods = computeTotalMaxPods()
    if (maxPodsPerNode > maxPods || maxPodsPerNode === 0){
      setMaxPodsPerNode(maxPods)
    }
  }, [maxPodsPerNode, ipresults, numnodes, computeTotalMaxPods])
  
  React.useEffect( () => {
    setAvgPodCpu(nodecpu / maxPodsPerNode)
    let podMem = nodemem / maxPodsPerNode
    setAvgPodMem(podMem * memunit)
  }, [maxPodsPerNode, nodecpu, nodemem, memunit])

  //const kubesystempods = 18
  const nplusone = 1
  const azurereservedips = 5

  return (
    <div className="App">
      <h1>AKS Planning Calculator</h1>
      <fieldset>
        <legend>Nodes</legend>
        <div>
          <label htmlFor="numnodes">Number of Nodes:</label>
          <input type="number" name="numnodes" onChange={handleNumnodesChange} value={numnodes} />
        </div>
        <div>
          <label htmlFor="nodecpu">Node vCPU(s):</label>
          <input type="number" name="nodecpu" onChange={handleNodecpuChange} value={nodecpu} />
        </div>
        <div>
          <label htmlFor="nodemem">Node RAM (GB):</label>
          <input type="number" name="nodemem" onChange={handleNodememChange} value={nodemem} />
        </div>
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
        <div>
          <label hmtlFor="maxpodspernode">Max number of pods per node:</label>
          <input type="number" onChange={handleMaxpodspernodeChange} name="maxpodspernode" value={ maxPodsPerNode } /> (Accounting for N+1 for upgrades)
        </div>
        <div>
          <label htmlFor="avgpodcpu">Average vCPU per pod:</label>
          <input type="number" onChange={handleAvgpodcpuChange} name="avgpodcpu" value={avgPodCpu} />
        </div>
        <div>
          <label htmlFor="avgpodmem">Average RAM per pod:</label>
          <input type="number" onChange={handleAvgpodmemChange} name="avgpodmem" value={avgPodMem} />
          <select value={memunit} onChange={handleMemunitChange} >
            <option value="1">GB</option>
            <option value="1024">MB</option>
          </select>
        </div>
      </fieldset>
    </div>
  );
}

export default App;
