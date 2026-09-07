import { HistoricDistrictInfo } from "../types";

export const HISTORIC_DISTRICTS: Record<string, HistoricDistrictInfo> = {
  "Mission Inn Historic District": {
    id: "Q141335457",
    name: "Mission Inn Historic District",
    description: "Historic district",
    wikidataId: "Q141335457",
    wikidataUrl: "https://www.wikidata.org/wiki/Q141335457",
    polygon: null,
    hasPolygon: false,
  },
  "Seventh Street Historic District": {
    id: "Q141335553",
    name: "Seventh Street Historic District",
    description: "Historic district",
    wikidataId: "Q141335553",
    wikidataUrl: "https://www.wikidata.org/wiki/Q141335553",
    polygon: null,
    hasPolygon: false,
  },
};

export function getDistrictInfo(name: string): HistoricDistrictInfo {
  return (
    HISTORIC_DISTRICTS[name] || {
      id: "",
      name,
      description: "Historic district",
      polygon: null,
      hasPolygon: false,
    }
  );
}
