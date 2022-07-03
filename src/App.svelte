<script>
	import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import { andThePointsGoTo } from "../utils/pointsHandler"
  import compare from "../utils/compare"

  const pointFrom = get(pointFromArray);
  const votingLength = [...Array(pointFrom.length).keys()];

  let participantsStore = [];

  participantsArray.subscribe((data) => {

    participantsStore = data;

  });
  
  function sortUpdate(){
    participantsStore.sort(compare);
  }

  function onClick(){
    andThePointsGoTo(pointFrom, votingLength.pop());
    // setTimeout(() => console.log("Waiting..."), 3000);
    sortUpdate();
  }

</script>

<Navbar />
<Table />

<div class="points-text">
  <p>{"later"}</p>
</div>

<div class="points-button">
  <button on:click={() => onClick()}>Give points</button>
</div>


<style>

  :global(body){
    background: rgb(63,94,251);
    background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%); 
    background-size: auto;
  }

.points-text {
  position: absolute;
  right: 200px;
  bottom: 50px;;
}

.points-button {
  position: absolute;
  right: 100px;
  bottom: 50px;
}
</style>