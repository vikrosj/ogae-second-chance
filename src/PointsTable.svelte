<script>
	export let tableData = [
			{
				vitae : "dolorem",
				lectus : "ipsum",
				quisquam : "quia"
			},
			{
				vitae : "amet",
				lectus : "consectetur",
				quisquam : "adipisci"
			}
		];
</script>

<table>
	<thead>
		<!-- <tr>
			{#each Object.keys(tableData[0]) as columnHeading}
				<th>{columnHeading}</th>
			{/each}
		<tr/> -->
	</thead>
	<tbody>
		{#each Object.values(tableData) as row}
			<tr>
				{#each Object.values(row) as cell}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
  table, td {
    border: 1px solid;
    border-collapse: collapse;
    margin: 10px;
  }
</style>