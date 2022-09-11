import { participantsArray } from './../voting/participants';
import compare from "../utils/compare";

let participantsStore = [];

participantsArray.subscribe((data) => {
  participantsStore = data;

});

function addPoints(pointsTo, pointsValue){

  
  participantsArray.update(currentData => {
      let cp = [...currentData];
      let specific = cp.find((row) => row.Name == pointsTo);

      specific.Points+= pointsValue;
      return cp;
      });
  };

export function andThePointsGoTo(pointsTo){
    for (const country in pointsTo) {

      addPoints(country, pointsTo[country]);

    }
};

export function sortUpdate(){
  participantsStore.sort(compare);
}
