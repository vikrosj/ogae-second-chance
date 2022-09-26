<script>
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import PointsButton from "./PointsButton.svelte";
  import Video from "./Video.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import { fromCountry, visible, alpha2Code } from "../utils/variables" ;

  console.log($visible);

  function emoji(fromCountry){
    console.log(fromCountry)

    if (fromCountry == "ROW"){
      return "😎"
    }
    else if (fromCountry == "Guest-jury"){
      return "✨"
    }
    else {
      return countryFlagEmoji.get($alpha2Code).emoji
    }
  }
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
  <p>{$fromCountry} {emoji($fromCountry)}</p>
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