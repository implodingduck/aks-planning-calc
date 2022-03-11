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
  const [reqNodecpu, setReqNodecpu] = React.useState(2)
  const [nodemem, setNodemem] = React.useState(7)
  const [reqNodemem, setReqNodemem] = React.useState(7)
  const [podsPerNode, setPodsPerNode] = React.useState(0)
  const [maxPodsPerNode, setMaxPodsPerNode] = React.useState(0)
  const [avgPodCpu, setAvgPodCpu] = React.useState(0)
  const [maxPodCpu, setMaxPodCpu] = React.useState(0)
  const [avgPodMem, setAvgPodMem] = React.useState(0)
  const [maxPodMem, setMaxPodMem] = React.useState(0)
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
      if (memunit === parseFloat(1024)){
        setAvgPodMem( avgPodMem / 1024 )
      }else {
        setAvgPodMem( avgPodMem * 1024 )
      }
      setMemunit(parseInt(e.target.value))
    }else{
      setMemunit('')
    }
  }

  const handlePodspernodeChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      console.log('Changing to: ' + e.target.value)
      setPodsPerNode(parseInt(e.target.value))
    }else{
      setPodsPerNode('')
    }
  }
  
  const handleAvgpodcpuChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setAvgPodCpu(parseFloat(e.target.value))
      setNodecpu( parseFloat(e.target.value) * podsPerNode )
    }else{
      setAvgPodCpu('')
    }
  }

  const handleAvgpodmemChange = (e) => {
    if ( cidrUtils.isNumber(e.target.value)){
      setAvgPodMem(parseFloat(e.target.value))
      setReqNodemem( (parseFloat(e.target.value) * podsPerNode) / memunit )
    }else{
      setAvgPodMem('')
    }
  }

  const computeTotalMaxPods = React.useCallback(() => {
    return Math.floor((ipresults.ipAvailable - azurereservedips - (numnodes + nplusone)) / (numnodes + nplusone))
  }, [ipresults, numnodes])

  // DETERMINE MAX PODS
  React.useEffect( () => {
    let maxPods = computeTotalMaxPods()
    setMaxPodsPerNode(maxPods)
    if ( podsPerNode === 0 ){
      setPodsPerNode(maxPods)
    }
  }, [maxPodsPerNode, podsPerNode, ipresults, numnodes, computeTotalMaxPods])
  
  // DETERMINE MAX CPU
  React.useEffect( () => {
    let newMaxPodCpu = nodecpu / podsPerNode
    setMaxPodCpu(newMaxPodCpu)
    if(avgPodCpu === 0 || avgPodCpu === Infinity){
      setAvgPodCpu(newMaxPodCpu)
    }
  }, [nodecpu, avgPodCpu, podsPerNode])

  // DETERMINE MAX MEM
  React.useEffect( () => {
    let podMem = nodemem / podsPerNode * memunit
    setMaxPodMem(podMem)
    if (avgPodMem === 0 || avgPodMem === Infinity){
      setAvgPodMem(podMem)
    }
  }, [podsPerNode, nodemem, memunit, avgPodMem])

  // ADJUST NODE STUFF
  React.useEffect( () => {
    if ( nodecpu < reqNodecpu ){
      setNodecpu(reqNodecpu)
    }
    if ( nodemem < reqNodemem ) {
      setNodemem(reqNodemem)
    }
  }, [nodecpu, reqNodecpu, nodemem, reqNodemem])

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
          <input type="number" name="nodecpu" onChange={handleNodecpuChange} value={nodecpu} /> (Actual Required: {reqNodecpu})
        </div>
        <div>
          <label htmlFor="nodemem">Node RAM (GB):</label>
          <input type="number" name="nodemem" onChange={handleNodememChange} value={nodemem} /> (Actual Required: {reqNodemem})
        </div>
        <a href="https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/">Azure Instance Sizes</a>
      </fieldset>
      <fieldset>
        <legend>Network (Azure CNI)</legend>
        <label htmlFor='ipspace'>Subnet CIDR:</label>
        <input type="text" onChange={handleIpSpaceChange} name="ipspace" value={ipspace}/>
        <div>
          <p>{ (ipresults.error) ? <span className='error'>{ ipresults.error }</span> : <span>{ipresults.ipMin} - {ipresults.ipMax} ({ipresults.ipAvailable - azurereservedips}  + {azurereservedips} Azure reserved addresses)</span> }</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Pods</legend>
        <div>
          <label hmtlFor="podspernode">Max number of pods per node:</label>
          <input type="number" onChange={handlePodspernodeChange} name="podspernode" value={ podsPerNode } /> (Actual Max: {maxPodsPerNode} Accounting for N+1 for upgrades)
        </div>
        <div>
          <label htmlFor="avgpodcpu">Average vCPU per pod:</label>
          <input type="number" step=".001" onChange={handleAvgpodcpuChange} name="avgpodcpu" value={avgPodCpu} /> (Actual Max: {maxPodCpu})
        </div>
        <div>
          <label htmlFor="avgpodmem">Average RAM per pod:</label>
          <input type="number" step=".01" onChange={handleAvgpodmemChange} name="avgpodmem" value={avgPodMem} /> (Actual Max: {maxPodMem})
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
