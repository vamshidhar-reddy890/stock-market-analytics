import api from "./api";

export const getPrediction = async (symbol) => {

  const response = await api.get(
    `/predictions/${symbol}`
  );

  return response.data;
};

export const getModelComparison = async (symbol) => {

  const response = await api.get(
    `/predictions/${symbol}/models`
  );

  return response.data;
};