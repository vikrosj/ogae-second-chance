<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let country;
  export let points;
  export let flag;
  let showControls = false;

  const addPoint = () => (points += 1);
  const removePoint = () => (points -= 1);
</script>

<style>
  h1 {
    color: #204f6e;
  }

  h3 {
    margin-bottom: 10px;
  }
</style>

<div class="card">
  <h1>
    {flag} {country}
  </h1>
  <h3>Points: {points}</h3>
</div>
