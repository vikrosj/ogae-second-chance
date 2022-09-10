  
<script>  
  import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
  import { andThePointsGoTo } from "../utils/pointsHandler";
  import compare from "../utils/compare";
  import { fromCountry, visible, alpha2Code } from "./variables";

  const localFromCountry = $fromCountry;
  const localAlpha2Code = $alpha2Code;
  const localVisible = $visible;

  const pointFrom = get(pointFromArray);
  
  let participantsStore = [];

  participantsArray.subscribe((data) => {
    participantsStore = data;

  });
  
  function sortUpdate(){
    participantsStore.sort(compare);
  }

  function onClick(){
       
    pointFrom.forEach((country,i) => {
      setTimeout(() => {
      andThePointsGoTo(country.Points);

      localFromCountry.set(country.Name);
      localAlpha2Code.set(country.Alpha2Code);
      LocalVisible.set(true);

      sortUpdate();
    }, i*1000);
  });
  }
</script>

<div class="points-button">
    <button class="button-2" on:click={() => onClick()}>1-10 points</button>
</div>


<style>

.points-button {
  position: absolute;
  right: 310px;
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
  background-color: yellow;
  color: black;
}
</style>