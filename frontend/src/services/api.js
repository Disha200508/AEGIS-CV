import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOverviewStats = () => api.get('/stats/overview');

// Data Integrity APIs
export const listAssets = () => api.get('/data/assets');
export const uploadImage = (formData) => api.post('/data/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const verifyAsset = (assetId) => api.post(`/data/verify/${assetId}`);

// Model Integrity APIs
export const getActiveModel = () => api.get('/model/active');
export const verifyModel = () => api.post('/model/verify');

// Inference APIs
export const runInference = (assetId, confThreshold = 0.25) => 
  api.post('/inference/run', { asset_id: assetId, conf_threshold: confThreshold });
export const listInferenceRecords = () => api.get('/inference/records');
export const verifyInferenceRecord = (recordId) => api.post(`/inference/verify/${recordId}`);

// Ledger APIs
export const listLedgerBlocks = () => api.get('/ledger/blocks');
export const verifyLedgerChain = () => api.post('/ledger/verify');

// Simulation APIs
export const simulateDatasetTamper = (assetId = null) => 
  api.post('/simulation/tamper-dataset', { asset_id: assetId });
export const simulateModelTamper = (modelId = null) => 
  api.post('/simulation/tamper-model', { model_id: modelId });
export const simulateInferenceTamper = (recordId = null) => 
  api.post('/simulation/tamper-inference', { record_id: recordId });
export const restoreDemoState = () => api.post('/simulation/restore');

export default api;
