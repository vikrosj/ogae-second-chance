<script>
	import { twelvePointsFromArray } from "./../voting/12-points-from";
	import { andThePointsGoTo, sortUpdate } from "../utils/pointsHandler";
	import { fromCountry, visible, alpha2Code } from "../utils/variables";

	$: pauseVideo = true;
	let volume = 1;
	let countryGivingPoints;
	let twelvePoints = $twelvePointsFromArray.reverse();
	const videoPath = "static/12_points_from/";

	$: videoSrc = "";

	function changeSrc(){
		
		if (twelvePoints.length == 0){
			pauseVideo = true;
			visible.set(false);
		}

		else {
			pauseVideo = false;
			countryGivingPoints = twelvePoints.pop();
			fromCountry.set(countryGivingPoints.Name);
			alpha2Code.set(countryGivingPoints.Alpha2Code);
			visible.set(true);
			videoSrc = videoPath + countryGivingPoints.Video;
		}
	}

	document.addEventListener("ended", function() {
		andThePointsGoTo(countryGivingPoints.PointsTo);
		sortUpdate();
		changeSrc();
	}, true);

</script>

<button class="button-2" on:click={() => changeSrc()}>
	{pauseVideo ? "12 points" : "Pause"}
</button>

<video poster="static/esc_norway.jpg" src={videoSrc}
	bind:volume={volume}
	bind:paused={pauseVideo}
	autoplay>
	<track kind="captions">
</video>

<style>
	video {
		max-width: 500px;
		max-height: 300px;
		margin-top: -400px;
		float: left;
    	position: relative;
    	left: 70%;
	}

	.button-2 {

		display: inline-block;
		outline: 0;
		border:0;
		cursor: pointer;
		text-decoration: none;
		position: absolute;
		color: #000;
		background: rgb(238,174,202);;
		line-height: 30px;
		border-radius: 40px;
		padding: 20px;
		font-size: 30px;
		font-weight: 600;
		box-shadow: rgb(255, 198, 0) -2px -2px 0px 2px, rgb(246, 84, 174) 0px 0px 0px 4px, rgba(0, 0, 0, 0.05) 0px 0px 2px 7px;
		transition: all 0.2s;
		right: 120px;
  		bottom: 50px;
	}

	.button-2:hover {
		background-color: yellow;
		color: black;
	}

	button {
		position: absolute;
  		right: -300px;
  		bottom: -150px;
	}
</style>