import fetch from "node-fetch";

export async function init () {
    await Avatar.lang.addPluginPak('AirQuality');
}

export async function action(data, callback) {

	try {

		const L = await Avatar.lang.getPak('AirQuality', data.language);

		const tblActions = {
			getAir: async () => await getAir(data.client, L)
		};

		info("AirQuality:", data.action.command, "from", data.client);

		if (tblActions[data.action.command]) {
			await tblActions[data.action.command]();
		}

	} catch (err) {
		if (data.client) Avatar.Speech.end(data.client);
		if (err.message) error(err.message);
	}

	callback();
}

const getAir = async (client, L) => {

	const apiKey = Config.modules.AirQuality.apiKey;

	try {

		const response = await fetch(`http://api.airvisual.com/v2/nearest_city?key=${apiKey}`);

		if (!response.ok) {
			throw new Error(L.get("speech.errorHttp" + response.status));
		}

		const result = await response.json();

		const town = result.data.city;
		const indice = result.data.current.pollution.aqicn;
		const air = getAirQuality(indice);

		Avatar.speak(L.get("speech.air", town, air, indice), client, () => { Avatar.Speech.end(client) });

	 } catch (err) {
		 error("Air Quality ERROR:", err.message);
		 Avatar.speak(L.get(["speech.errorAccess"]), client, () => {Avatar.Speech.end(client)});
	}
}

const getAirQuality = (indice) => {

	if (indice <= 50) return "bonne";
	if (indice <= 100) return "modérée";
	if (indice <= 150) return "mauvaise pour les personnes sensibles";
	if (indice <= 200) return "mauvaise";
	if (indice <= 300) return "très mauvaise";
	return "dangereuse";
}
