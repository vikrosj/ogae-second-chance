<script>
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import PointsButton from "./PointsButton.svelte";
  import Video from "./Video.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import { fromCountry, visible, alpha2Code, guestEmoji, rowEmoji } from "../utils/variables" ;

  console.log($visible);

  function emoji(fromCountry){
    console.log(fromCountry)

    if (fromCountry == "ROW"){
      return rowEmoji;
    }
    else if (fromCountry == "Guest-jury"){
      return guestEmoji;
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

<div class="points-text">
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

  .points-text{
    position: absolute;
    margin-left: 1%;
    bottom: 20px;
    font-size: 60px;
    font-weight: 600;
  } 
              
</style>