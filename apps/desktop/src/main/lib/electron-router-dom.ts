import { createElectronRouter } from 'electron-router-dom';

export const { registerRoute } = createElectronRouter({
  port: 5173,
  types: {
    ids: ['main'],
  },
});
