  
<script>  
  import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
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

<div class="points-button">
    <button class="button-2" on:click={() => onClick()}>Give points</button>
</div>

<style>

.points-button {
  position: absolute;
  right: 100px;
  bottom: 50px;
}

.button-2 {

  display: inline-block;
                outline: 0;
                border:0;
                cursor: pointer;
                text-decoration: none;
                position: relative;
                color: #000;
                background: rgb(238,174,202);;
                line-height: 30px;
                border-radius: 40px;
                padding: 20px;
                font-size: 30px;
                font-weight: 600;
                box-shadow: rgb(255, 198, 0) -2px -2px 0px 2px, rgb(246, 84, 174) 0px 0px 0px 4px, rgba(0, 0, 0, 0.05) 0px 0px 2px 7px;
                transition: all 0.2s;
                
}

.button-2:hover {
  background-color: green;
  color: black;
}
</style>