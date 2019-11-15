/*eslint id-length: 0*/
var COLORaxisSCALE = 100,
parameterDatasets = {
  PBf: {
    name: "Lead (Fine)",
    filename: "data/PBf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1000,
    percentiles: "0% to 99%",
		percentileBottom: 0,
    percentileTop: 0.0087
  },
  ALf: {
    name: "Aluminum (Fine)",
    filename: "data/ALf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: false,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.23
  },
  CUf: {
    name: "Copper (Fine)",
    filename: "data/CUf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1000,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.0062
  },
  dv: {
    name: "Deciview",
    filename: "data/deciview.csv",
    unit: "dv",
    isDisplay: false,
    scale: 1,
    percentiles: "0% to 98%",
		percentileBottom: 0,
    percentileTop: 28.14
  },
  NH4f: {
    name: "Ammonium Ion (Fine)",
    filename: "data/NH4f.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 2.98
  },
  ECf: {
    name: "Carbon, Elemental Total (Fine)",
    filename: "data/ECf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.72
  },
  NO3f: {
    name: "Nitrate (Fine)",
    filename: "data/NO3f.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 1.74
  },
  SIf: {
    name: "Silicon (Fine)",
    filename: "data/SIf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.5
  },
  OCf: {
    name: "Carbon, Organic Total (Fine)",
    filename: "data/OCf.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 3
  },
  SO4f: {
    name: "Sulfate (Fine)",
    filename: "data/SO4f.csv",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 98%",
		percentileBottom: 0,
    percentileTop: 6.57
  }
};
