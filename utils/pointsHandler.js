import { participantsArray } from './../voting/participants';

function addPoints(pointsTo, pointsValue){
    participantsArray.update(currentData => {
      let cp = [...currentData];
      let specific = cp.find((row) => row.Name == pointsTo);

      specific.Points+= pointsValue;
      console.log(specific);
      return cp;
      });
  };

export function andThePointsGoTo(array, index){
    const row = array[index];
    const object = row.Points;
  
    // givesPoints = "Points from ".concat(row.Name);

    for (const property in object) {
      
      console.log(`${object[property]} points go to ${property}`);

      addPoints(property, object[property]);

    }
};
