
export default function initalizeParticipants(array, country_code, name) {
		array.forEach(el => {
		el.value ++;
		country_code.push(el.Alpha2Code);
    name.push(el.Name);
	})
	}