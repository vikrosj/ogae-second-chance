import { participantsArray } from './../voting/participants';
import compare from "../utils/compare";


let participantsStore = [];

participantsArray.subscribe((data) => {
  participantsStore = data;

});

function sortUpdate(){
    participantsStore.sort(compare);
  }


export default sortUpdate;