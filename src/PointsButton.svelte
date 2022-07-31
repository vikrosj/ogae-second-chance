  
<script>  
  import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
  import { andThePointsGoTo } from "../utils/pointsHandler";
  import compare from "../utils/compare";
  import countryFlagEmoji from "country-flag-emoji";

  const pointFrom = get(pointFromArray);
  
  let participantsStore = [];
  let fromCountry = "";
  let visible = false;
  let alpha2Code = "GB";

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

      fromCountry = country.Name;
      alpha2Code = country.Alpha2Code;
      visible = true;

      sortUpdate();
    }, i*1000);
  });
  }
</script>

<div class="points-button">
    <button class="button-2" on:click={() => onClick()}>1-10 points</button>
</div>

<div class="points-text-1">
  {#if visible}
  <p>Points from: </p>
  {/if}
</div>

<div class="points-text-2">
  {#if visible}
  <p>{fromCountry} {countryFlagEmoji.get(alpha2Code).emoji}</p>
  {/if}
</div>

<style>

.points-text-1 {
  position: absolute;
  right: 950px;
  bottom: 50px;
  font-size: 30px;
  font-weight: 600;
}

.points-text-2 {
  position: absolute;
  right: 660px;
  bottom: 50px;
  font-size: 30px;
  font-weight: 600;
} 

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