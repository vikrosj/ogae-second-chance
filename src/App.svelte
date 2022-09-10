<script>
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import PointsButton from "./PointsButton.svelte";
  import Video from "./Video.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import { fromCountry, visible, alpha2Code } from "./variables" ;

  const localFromCountry = $fromCountry;
  const localAlpha2Code = $alpha2Code;
  const localVisible = $visible;

  console.log(localAlpha2Code,localFromCountry,localVisible)
</script>

<Navbar />
<Table />
<PointsButton/>
<Video/>

<div class="points-text-1">
  {#if localVisible}
  <p>Points from: </p>
  {/if}
</div>

<div class="points-text-2">
  {#if localVisible}
  <p>{localFromCountry} {countryFlagEmoji.get(localAlpha2Code).emoji}</p>
  {/if}
</div>



<style>
  :global(body){
    background: rgb(63,94,251);
    background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%); 
    background-size: auto;
  }

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
              
</style>