import { getClient } from "@/apollo-client";
import CalloutCard from "@/components/CalloutCard";
import HumidityChart from "@/components/HumidityChart";
import InformationPanel from "@/components/InformationPanel";
import RainChart from "@/components/RainChart";
import StatCard from "@/components/StatCard";
import TempChart from "@/components/TempChart";
import fetchWeatherQuery from "@/graphql/queries/fetchWeatherQueries";
import getBasePath from "@/lib/getBasePath";
import cleanData from "@/lib/cleanData";
import axios from "axios";
import { OpenAIApi } from "openai";
export const revalidate = 60;

type Props = {
  params: {
    city: string;
    lat: string;
    long: string;
  };
};

async function WeatherPage({ params: { city, lat, long } }: Props) {
  const client = getClient();
  const { data } = await client.query({
    query: fetchWeatherQuery,
    variables: {
      current_weather: "true",
      longitude: long,
      latitude: lat,
      timezone: "GMT",
    },
  });

  const results: Root = data.myQuery;
  const dataToSend = cleanData(results, city);
  //................................................................../;
  const currentTemp = dataToSend.current_weather.temperature;

  const currentWindSpeed = dataToSend.current_weather.windspeed;
  const currentWindDirection = dataToSend.current_weather.winddirection;
  const precipitationProbability =
    dataToSend.hourly.precipitation_probability[0];
  const currentUVIndex = parseInt(results.daily.uv_index_max[0].toFixed(1));

  let summary = `The current temperature outside is ${currentTemp}°C and a wind speed of ${currentWindSpeed} km/h coming from the ${currentWindDirection}° direction.`;

  if (precipitationProbability > 50) {
    summary +=
      " It's likely to rain later today, so be sure to carry an umbrella or raincoat.";
  }

  summary += ` The UV index is currently ${currentUVIndex}.`;

  if (currentTemp > 30) {
    summary +=
      " It's very hot outside, so be sure to stay hydrated and avoid prolonged exposure to the sun.";
  } else if (currentTemp > 20) {
    summary +=
      " It's a nice day out, but be sure to wear sunscreen and stay hydrated if you're spending time outside.";
  } else {
    summary +=
      " It's a bit chilly outside, so be sure to wear warm clothes if you're going to be outside for an extended period of time.";
  }

  if (currentUVIndex >= 6) {
    summary +=
      " The UV index is very high today, so be sure to wear sunscreen and avoid prolonged exposure to the sun.";
  }
  //................................................................../;

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <InformationPanel city={city} lat={lat} long={long} results={results} />
      <div className="flex-1 p-5 lg:p-10">
        <div className="p-5">
          <div className="pb-5">
            <h2 className="text-xl font-bold">Todays Overview</h2>
            <p className="text-sm text-gray-400">
              Last Updated at:
              {new Date(results.current_weather.time).toLocaleString()}(
              {results.timezone})
            </p>
          </div>
          <div className="m-2 mb-10">
            <CalloutCard
              message={`Hi this is Ubaid reporting live from MKF HQ. ${summary}`}
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 m-2">
            <StatCard
              title="Maximum Temperature"
              metric={`${results.daily.temperature_2m_max[0].toFixed(1)}°`}
              color="yellow"
            />
            <StatCard
              title="Minimum Temperature"
              metric={`${results.daily.temperature_2m_min[0].toFixed(1)}°`}
              color="green"
            />
            <div>
              <StatCard
                title="UV Index"
                metric={`${results.daily.uv_index_max[0].toFixed(1)}`}
                color="rose"
              />
              {Number(results.daily.uv_index_max[0].toFixed(1)) > 6 && (
                <CalloutCard
                  message={"The UV is high today, be sure to wear SPF!"}
                  warning
                />
              )}
            </div>

            <div className="flex space-x-3">
              <StatCard
                title="Wind Speed"
                metric={`${results.current_weather.windspeed.toFixed(1)}m/s`}
                color="cyan"
              />
              <StatCard
                title="Wind Direction"
                metric={`${results.current_weather.winddirection.toFixed(1)}°`}
                color="violet"
              />
            </div>
          </div>
        </div>
        <hr className="mb-5" />
        <div className="space-y-3">
          <TempChart results={results} />
          <RainChart results={results} />
          <HumidityChart results={results} />
        </div>
      </div>
    </div>
  );
}
export default WeatherPage;
