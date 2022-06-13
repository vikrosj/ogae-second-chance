<script>
  import Navbar from "./Navbar.svelte";
  import Player from "./Player.svelte";
  import AddPlayer from "./AddPlayer.svelte";
  import points from "../voting/points";
  import PointsTable from "./PointsTable.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import { studentsArray } from '../voting/points-store';

  let players =  points;
  let slicedArray = Object.values(studentsArray);
  console.log("slicedarray", slicedArray);

   const addPlayer = e => {
     const newPlayer = e.detail;
  //   players = [...players, newPlayer];
  };

  console.log(countryFlagEmoji.data);
</script>


<Navbar />
<PointsTable tableData={$studentsArray}/>
<div class="container">
  {#if players.length === 0}
    <p>No Players</p>
  {:else}
    {#each players as player}
      <Player
        flag={countryFlagEmoji.get(player.country_code).emoji}
        country={player.country}
        points={player.id}/>
    {/each}
  {/if}
</div>
<AddPlayer on:addplayer={addPlayer} />

