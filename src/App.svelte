<script>
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import PointsButton from "./PointsButton.svelte";
  import Video from "./Video.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import { fromCountry, visible, alpha2Code } from "./variables" ;

  console.log($visible);
</script>

<Navbar />
<Table />
<PointsButton/>
<Video/>

<div class="points-text-1">
  {#if $visible}
  <p>Points from: </p>
  {/if}
</div>

<div class="points-text-2">
  {#if $visible}
  <p>{$fromCountry} {countryFlagEmoji.get($alpha2Code).emoji}</p>
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
  right: 21%;
  bottom: 300px;
  font-size: 30px;
  font-weight: 600;
}

  .points-text-2 {
    position: absolute;
    right: 6%;
    bottom: 300px;
    font-size: 30px;
    font-weight: 600;
  } 
              
</style>