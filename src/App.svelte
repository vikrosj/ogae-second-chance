<script>
	import Navbar from "./Navbar.svelte";
  import Table from "./Table.svelte";
  import PointsButton from "./PointsButton.svelte";
  
</script>

<Navbar />
<Table />
<PointsButton/>

<div class="points-text">
  <p>{"later"}</p>
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
</style>